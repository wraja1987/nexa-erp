/**
 * Phase 24 — Workflow Enforcer
 * 
 * High-level workflow enforcement functions for integration with modules.
 */

import { getWorkflowDefinition } from "./registry";
import { evaluateTransition } from "./engine";
import { buildWorkflowContext } from "./context";
import { recordWorkflowEvent, ensureWorkflowInstance, getWorkflowInstance } from "./history";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { WorkflowStateChanged, WorkflowTransitionDenied } from "@/server/events/types";
import { captureError } from "@/server/observability/sentry";
import { incrementCounter } from "@/server/observability/metrics";

/**
 * Check if a workflow transition is allowed
 * 
 * Returns { allowed: true } if transition is allowed, or { allowed: false, reason } if denied.
 */
export async function checkWorkflowTransition(params: {
  entityType: string;
  entityId: string;
  tenantId: string;
  actorId: string;
  actorRole: string;
  action: string;
}): Promise<{ allowed: boolean; reason?: string; nextState?: string }> {
  const { entityType, entityId, tenantId, actorId, actorRole, action } = params;

  // Get workflow definition
  const { supported, def, reason: defReason } = await getWorkflowDefinition(entityType, tenantId);

  if (!supported || !def) {
    // No workflow defined for this entity type - allow transition (backward compatibility)
    console.log(`[Workflow] No workflow definition for ${entityType}, allowing transition`);
    return { allowed: true };
  }

  // Get or create workflow instance
  const instanceResult = await getWorkflowInstance(tenantId, entityType, entityId);
  let currentState: string;

  if (instanceResult.supported && instanceResult.instance) {
    currentState = instanceResult.instance.currentStep;
  } else {
    // Ensure instance exists with initial state
    const ensureResult = await ensureWorkflowInstance({
      tenantId,
      entityType,
      entityId,
      initialState: def.initialState,
    });
    if (!ensureResult.supported) {
      console.warn(`[Workflow] Failed to ensure instance for ${entityType}:${entityId}`);
    }
    currentState = def.initialState;
  }

  // Build context
  let context;
  try {
    context = await buildWorkflowContext(entityType, entityId, tenantId, actorId, actorRole);
    // Override currentState from instance
    context.currentState = currentState;
  } catch (error: any) {
    // If context build fails, log and allow (backward compatibility)
    console.warn(`[Workflow] Failed to build context for ${entityType}:${entityId}:`, error);
    captureError(error, { module: "workflow", operation: "build_context" });
    return { allowed: true };
  }

  // Evaluate transition
  const decision = evaluateTransition(def, context.currentState, action, context);

  if (!decision.allowed) {
    // Record denial event
    try {
      const event: WorkflowTransitionDenied = {
        id: newEventId(),
        tenantId,
        type: "workflow.transition.denied",
        occurredAt: nowIso(),
        source: "workflow.enforcer",
        version: 1,
        payload: {
          entityType,
          entityId,
          currentState: context.currentState,
          attemptedAction: action,
          reason: decision.reason || "Unknown reason",
          actorId,
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[Workflow] Failed to publish transition.denied event:`, error);
    }

    // Record metrics
    incrementCounter("workflow_transition_total", {
      entityType,
      action,
      result: "denied",
      tenantId,
    });

    // Log to Sentry
    captureError(new Error(`Workflow transition denied: ${decision.reason}`), {
      module: "workflow",
      operation: "check_transition",
      entityType,
      entityId,
      action,
      reason: decision.reason,
    });

    return {
      allowed: false,
      reason: decision.reason,
    };
  }

  // Transition allowed
  return {
    allowed: true,
    nextState: decision.nextState,
  };
}

/**
 * Record a successful workflow state change
 */
export async function recordWorkflowStateChange(params: {
  entityType: string;
  entityId: string;
  tenantId: string;
  actorId: string;
  fromState: string;
  toState: string;
  action: string;
}): Promise<void> {
  const { entityType, entityId, tenantId, actorId, fromState, toState, action } = params;

  // Record to history (DB-backed)
  await recordWorkflowEvent({
    tenantId,
    entityType,
    entityId,
    fromState,
    toState,
    action,
    actorId,
  }).catch((error) => {
    // Log but don't fail - history is best-effort
    console.warn(`[Workflow] Failed to record history:`, error);
  });

  // Publish event
  try {
    const event: WorkflowStateChanged = {
      id: newEventId(),
      tenantId,
      type: "workflow.state.changed",
      occurredAt: nowIso(),
      source: "workflow.enforcer",
      version: 1,
      payload: {
        entityType,
        entityId,
        fromState,
        toState,
        action,
        actorId,
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[Workflow] Failed to publish state.changed event:`, error);
  }

  // Record metrics
  incrementCounter("workflow_transition_total", {
    entityType,
    action,
    result: "allowed",
    tenantId,
  });
}

