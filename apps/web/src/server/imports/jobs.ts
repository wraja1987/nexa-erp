/**
 * Import Job Service
 * Manages import job metadata and undo tokens.
 * Returns supported:false when ImportJob model is missing (schema gap).
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type TenantContext = {
  tenantId: string;
  userId: string;
};

export type ImportJobLike = {
  id: string;
  tenantId: string;
  type: string;
  status: "pending" | "completed" | "failed";
  summary: {
    rowsProcessed: number;
    rowsSucceeded: number;
    rowsFailed: number;
  };
  undoToken?: {
    entityType: string;
    entityIds: string[];
  };
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
};

export type ImportJobSupportResult = {
  supported: boolean;
  reason?: string;
};

/**
 * Check if import job functionality is supported.
 * Returns false if ImportJob model is missing.
 */
export async function getImportSupport(): Promise<ImportJobSupportResult> {
  try {
    // Try to access a hypothetical ImportJob model
    // Since the model doesn't exist, this will fail gracefully
    await (prisma as any).importJob.count({ take: 0 }).catch(() => {
      // Expected to fail - model doesn't exist
    });

    // If we get here, the model might exist (but it doesn't in current schema)
    // Return false anyway since we know from schema scan that it's missing
    return {
      supported: false,
      reason: "Schema gap: No ImportJob model. Import job tracking and undo require schema migration.",
    };
  } catch {
    return {
      supported: false,
      reason: "Schema gap: No ImportJob model. Import job tracking and undo require schema migration.",
    };
  }
}

/**
 * Create import job record.
 * Returns supported:false if ImportJob model is missing.
 */
export async function createImportJob(
  tenantContext: TenantContext,
  type: string,
  summary: { rowsProcessed: number; rowsSucceeded: number; rowsFailed: number }
): Promise<{ supported: boolean; job: ImportJobLike | null; message?: string }> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      job: null,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    const job = await (prisma as any).importJob.create({
      data: {
        tenantId: tenantContext.tenantId,
        type,
        status: "pending",
        summary: summary as any,
        createdBy: tenantContext.userId,
      },
    });

    await auditEvent("IMPORT_JOB_CREATED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: job.id,
      type,
      summary,
    });

    return {
      supported: true,
      job: job as ImportJobLike,
    };
  } catch (e: any) {
    return {
      supported: false,
      job: null,
      message: `Failed to create import job: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Append log entry to import job.
 * Returns supported:false if ImportJob model is missing.
 */
export async function appendImportLog(
  jobId: string,
  entry: { level: "info" | "warn" | "error"; message: string; meta?: any }
): Promise<{ supported: boolean; message?: string }> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    // For now, just log to audit log
    await auditEvent("IMPORT_LOG", {
      jobId,
      level: entry.level,
      message: entry.message,
      meta: entry.meta,
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to append log: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Mark import job as completed.
 * Returns supported:false if ImportJob model is missing.
 */
export async function markImportCompleted(
  jobId: string,
  summary?: { rowsProcessed: number; rowsSucceeded: number; rowsFailed: number }
): Promise<{ supported: boolean; message?: string }> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    await (prisma as any).importJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        completedAt: new Date(),
        ...(summary ? { summary: summary as any } : {}),
      },
    });

    await auditEvent("IMPORT_JOB_COMPLETED", {
      jobId,
      summary,
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to mark job completed: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Mark import job as failed.
 * Returns supported:false if ImportJob model is missing.
 */
export async function markImportFailed(jobId: string, reason: string): Promise<{ supported: boolean; message?: string }> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    await (prisma as any).importJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        completedAt: new Date(),
      },
    });

    await auditEvent("IMPORT_JOB_FAILED", {
      jobId,
      reason,
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to mark job failed: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Register undo token for import job.
 * Returns supported:false if ImportJob model is missing.
 */
export async function registerUndoToken(
  jobId: string,
  undoInfo: { entityType: string; entityIds: string[] }
): Promise<{ supported: boolean; message?: string }> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    await (prisma as any).importJob.update({
      where: { id: jobId },
      data: {
        undoToken: undoInfo as any,
      },
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to register undo token: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get undo info for import job.
 * Returns supported:false if ImportJob model is missing.
 */
export async function getUndoInfo(jobId: string): Promise<{
  supported: boolean;
  undoInfo?: { entityType: string; entityIds: string[] };
  message?: string;
}> {
  const support = await getImportSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason,
    };
  }

  try {
    // This code would run if ImportJob model existed
    const job = await (prisma as any).importJob.findUnique({
      where: { id: jobId },
      select: { undoToken: true },
    });

    if (!job) {
      return {
        supported: true,
        message: "Import job not found",
      };
    }

    return {
      supported: true,
      undoInfo: job.undoToken as { entityType: string; entityIds: string[] } | undefined,
    };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to get undo info: ${e?.message || "unknown"}`,
    };
  }
}

