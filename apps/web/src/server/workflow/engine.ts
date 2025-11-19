/**
 * Phase 24 — Workflow Engine Core Logic
 * 
 * Pure, side-effect-free workflow evaluation functions.
 */

import type {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowDecision,
  WorkflowCondition,
  WorkflowTransition,
} from "./types";

/**
 * Evaluate a single condition against the context
 */
function evaluateCondition(condition: WorkflowCondition, context: WorkflowContext): boolean {
  switch (condition.type) {
    case "role":
      // Check if user has required role
      // SUPER_ADMIN always passes
      if (context.actorRole === "SUPER_ADMIN") return true;
      // Exact match or hierarchy check
      const roleHierarchy: Record<string, string[]> = {
        ADMIN: ["ADMIN", "SUPER_ADMIN"],
        MANAGER: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
        STAFF: ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
        VIEWER: ["VIEWER", "STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"],
      };
      const allowedRoles = roleHierarchy[condition.role] || [condition.role];
      return allowedRoles.includes(context.actorRole);

    case "amount":
      if (context.amount === undefined) return false;
      const amount = context.amount;
      switch (condition.operator) {
        case "<":
          return amount < condition.value;
        case ">=":
          return amount >= condition.value;
        case "<=":
          return amount <= condition.value;
        case ">":
          return amount > condition.value;
        default:
          return false;
      }

    case "dimension":
      // Stubbed: always passes (dimension data not available in current schema)
      // In future, check context.dimensions[condition.dimension] === condition.value
      return true;

    case "always":
      return true;

    default:
      return false;
  }
}

/**
 * Evaluate a transition against the context
 */
export function evaluateTransition(
  def: WorkflowDefinition,
  currentState: string,
  action: string,
  context: WorkflowContext
): WorkflowDecision {
  // Find matching transition
  const transition = def.transitions.find(
    (t) => t.fromState === currentState && t.action === action
  );

  if (!transition) {
    return {
      allowed: false,
      reason: `No transition found from state "${currentState}" with action "${action}"`,
    };
  }

  // Check if current state matches
  if (transition.fromState !== currentState) {
    return {
      allowed: false,
      reason: `Current state "${currentState}" does not match transition from state "${transition.fromState}"`,
    };
  }

  // Evaluate all conditions
  const failedConditions: WorkflowCondition[] = [];
  for (const condition of transition.conditions) {
    if (!evaluateCondition(condition, context)) {
      failedConditions.push(condition);
    }
  }

  if (failedConditions.length > 0) {
    return {
      allowed: false,
      reason: `Conditions not met: ${failedConditions.map((c) => JSON.stringify(c)).join(", ")}`,
      failedConditions,
    };
  }

  // All conditions passed
  return {
    allowed: true,
    nextState: transition.toState,
  };
}

/**
 * Get available actions for the current state and context
 */
export function getAvailableActions(
  def: WorkflowDefinition,
  currentState: string,
  context: WorkflowContext
): Array<{ action: string; label: string; transition: WorkflowTransition }> {
  const available: Array<{ action: string; label: string; transition: WorkflowTransition }> = [];

  for (const transition of def.transitions) {
    if (transition.fromState === currentState) {
      // Check if conditions pass
      const decision = evaluateTransition(def, currentState, transition.action, context);
      if (decision.allowed) {
        available.push({
          action: transition.action,
          label: transition.label,
          transition,
        });
      }
    }
  }

  return available;
}

/**
 * Get workflow state by ID
 */
export function getState(def: WorkflowDefinition, stateId: string): WorkflowDefinition["states"][0] | undefined {
  return def.states.find((s) => s.id === stateId);
}

