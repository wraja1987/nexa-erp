/**
 * Phase 24 — Workflow History
 * Task 8 Gap Closure: Full DB-backed implementation using WorkflowHistory model
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";
import type { WorkflowHistoryEntry } from "./types";

/**
 * Record a workflow event
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function recordWorkflowEvent(params: {
  tenantId: string;
  entityType: string;
  entityId: string;
  fromState: string;
  toState: string;
  action: string;
  actorId: string;
  reason?: string;
}): Promise<{ supported: boolean; recorded: boolean; reason?: string }> {
  const { tenantId, entityType, entityId, fromState, toState, action, actorId, reason } = params;

  try {
    // Find or create workflow instance
    let instance = await prisma.workflowInstance.findFirst({
      where: {
        tenantId,
        entityType,
        entityId,
      },
    });

    if (!instance) {
      // Get workflow definition to find definitionId
      const def = await prisma.workflowDefinition.findFirst({
        where: {
          tenantId,
          entityType,
          active: true,
        },
      });

      if (!def) {
        // No definition found, can't create instance
        // Fallback to audit log only
        try {
          await auditEvent("workflow.transition", {
            tenantId,
            actorId,
            entityType,
            entityId,
            fromState,
            toState,
            action,
            reason,
          });
        } catch (error) {
          // Ignore audit errors
        }

        return {
          supported: false,
          recorded: false,
          reason: "No workflow definition found for entity type",
        };
      }

      // Create instance
      instance = await prisma.workflowInstance.create({
        data: {
          tenantId,
          definitionId: def.id,
          entityType,
          entityId,
          currentStep: toState,
          status: "active",
        },
      });
    }

    // Create history entry
    await prisma.workflowHistory.create({
      data: {
        instanceId: instance.id,
        fromStep: fromState,
        toStep: toState,
        action,
        actorId,
        notes: reason || null,
      },
    });

    // Update instance current step
    await prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentStep: toState,
        updatedAt: new Date(),
      },
    });

    // Audit log (best-effort)
    try {
      await auditEvent("workflow.transition", {
        tenantId,
        actorId,
        entityType,
        entityId,
        fromState,
        toState,
        action,
        reason,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      recorded: true,
    };
  } catch (error: any) {
    // Fallback to audit log on error
    try {
      await auditEvent("workflow.transition", {
        tenantId,
        actorId,
        entityType,
        entityId,
        fromState,
        toState,
        action,
        reason,
      });
    } catch (auditError) {
      // Ignore audit errors
    }

    return {
      supported: false,
      recorded: false,
      reason: `Failed to record workflow event: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * List workflow history for an entity
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function listWorkflowHistory(
  entityType: string,
  entityId: string,
  tenantId: string
): Promise<{ supported: boolean; entries: WorkflowHistoryEntry[]; reason?: string }> {
  try {
    // Find workflow instance
    const instance = await prisma.workflowInstance.findFirst({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      include: {
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!instance) {
      return {
        supported: true,
        entries: [],
      };
    }

    // Transform to WorkflowHistoryEntry format
    const entries: WorkflowHistoryEntry[] = instance.history.map((h) => ({
      id: h.id,
      entityType,
      entityId,
      fromState: h.fromStep || "",
      toState: h.toStep,
      action: h.action,
      actorId: h.actorId,
      timestamp: h.createdAt.toISOString(),
      reason: h.notes || undefined,
    }));

    return {
      supported: true,
      entries,
    };
  } catch (error: any) {
    return {
      supported: false,
      entries: [],
      reason: `Failed to list workflow history: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Get workflow instance for an entity
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function getWorkflowInstance(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<{
  supported: boolean;
  instance?: {
    id: string;
    currentStep: string;
    status: string;
    startedAt: Date;
  };
  reason?: string;
}> {
  try {
    const instance = await prisma.workflowInstance.findFirst({
      where: {
        tenantId,
        entityType,
        entityId,
      },
    });

    if (!instance) {
      return {
        supported: false,
        reason: "No workflow instance found",
      };
    }

    return {
      supported: true,
      instance: {
        id: instance.id,
        currentStep: instance.currentStep,
        status: instance.status,
        startedAt: instance.startedAt,
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to get workflow instance: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Create or update workflow instance
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function ensureWorkflowInstance(params: {
  tenantId: string;
  entityType: string;
  entityId: string;
  initialState: string;
}): Promise<{ supported: boolean; instanceId?: string; reason?: string }> {
  const { tenantId, entityType, entityId, initialState } = params;

  try {
    // Find existing instance
    let instance = await prisma.workflowInstance.findFirst({
      where: {
        tenantId,
        entityType,
        entityId,
      },
    });

    if (instance) {
      return {
        supported: true,
        instanceId: instance.id,
      };
    }

    // Get workflow definition
    const def = await prisma.workflowDefinition.findFirst({
      where: {
        tenantId,
        entityType,
        active: true,
      },
    });

    if (!def) {
      return {
        supported: false,
        reason: "No workflow definition found",
      };
    }

    // Create instance
    instance = await prisma.workflowInstance.create({
      data: {
        tenantId,
        definitionId: def.id,
        entityType,
        entityId,
        currentStep: initialState,
        status: "active",
      },
    });

    return {
      supported: true,
      instanceId: instance.id,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to ensure workflow instance: ${error?.message || "unknown"}`,
    };
  }
}
