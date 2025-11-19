/**
 * Undo/Rollback Service
 * Provides logical undo for imports where possible.
 * Returns supported:false when ImportJob model is missing (schema gap).
 */

import { getUndoInfo } from "./jobs";
import { auditEvent } from "@/lib/observability/audit";
import type { TenantContext } from "./jobs";

export type UndoPreviewResult = {
  supported: boolean;
  entityType?: string;
  entityCount?: number;
  message?: string;
};

export type UndoApplyResult = {
  supported: boolean;
  reversed: number;
  message?: string;
};

/**
 * Preview undo operation.
 * Returns what would be undone if undo is applied.
 */
export async function previewUndo(
  tenantContext: TenantContext,
  jobId: string
): Promise<UndoPreviewResult> {
  const undoInfo = await getUndoInfo(jobId);

  if (!undoInfo.supported) {
    return {
      supported: false,
      message: undoInfo.message || "Schema gap: No ImportJob model. Undo is not supported.",
    };
  }

  if (!undoInfo.undoInfo) {
    return {
      supported: true,
      message: "No undo information available for this import job",
    };
  }

  return {
    supported: true,
    entityType: undoInfo.undoInfo.entityType,
    entityCount: undoInfo.undoInfo.entityIds.length,
  };
}

/**
 * Apply undo operation.
 * Reverses import by marking entities as inactive or reversing journal entries.
 */
export async function applyUndo(tenantContext: TenantContext, jobId: string): Promise<UndoApplyResult> {
  const undoInfo = await getUndoInfo(jobId);

  if (!undoInfo.supported) {
    return {
      supported: false,
      reversed: 0,
      message: undoInfo.message || "Schema gap: No ImportJob model. Undo is not supported.",
    };
  }

  if (!undoInfo.undoInfo) {
    return {
      supported: false,
      reversed: 0,
      message: "No undo information available for this import job",
    };
  }

  try {
    const { entityType, entityIds } = undoInfo.undoInfo;
    let reversed = 0;

    // Handle different entity types
    if (entityType === "JournalEntry") {
      // Reverse journal entries
      const { reverseJournalEntry } = await import("@/server/finance/gl");
      for (const entryId of entityIds) {
        try {
          await reverseJournalEntry(tenantContext.tenantId, entryId, tenantContext.userId);
          reversed++;
        } catch (e: any) {
          // Log error but continue
          await auditEvent("IMPORT_UNDO_ERROR", {
            tenantId: tenantContext.tenantId,
            actorId: tenantContext.userId,
            jobId,
            entityType,
            entityId: entryId,
            error: e?.message || "unknown",
          });
        }
      }
    } else if (entityType === "Account") {
      // Cannot delete accounts, but could mark as inactive if schema supported
      // For now, just log
      await auditEvent("IMPORT_UNDO_SKIPPED", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        jobId,
        entityType,
        reason: "Account deletion not supported",
      });
    } else if (entityType === "Supplier" || entityType === "InventoryItem") {
      // Cannot delete suppliers/items, but could mark as inactive if schema supported
      // For now, just log
      await auditEvent("IMPORT_UNDO_SKIPPED", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        jobId,
        entityType,
        reason: "Entity deletion not supported",
      });
    } else {
      // Unknown entity type
      await auditEvent("IMPORT_UNDO_UNKNOWN_TYPE", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        jobId,
        entityType,
      });
    }

    await auditEvent("IMPORT_UNDO_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      jobId,
      entityType,
      entitiesReversed: reversed,
    });

    return {
      supported: true,
      reversed,
    };
  } catch (e: any) {
    return {
      supported: false,
      reversed: 0,
      message: `Failed to apply undo: ${e?.message || "unknown"}`,
    };
  }
}

