/**
 * Core Attachment Service
 * Task 8 Gap Closure: Full DB-backed implementation using Attachment model
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";
import { getAttachmentConfig } from "./config";
import { buildObjectKey } from "./s3Client";
import { maybeEncryptFilename, maybeDecryptFilename } from "@/server/security/byokHooks";

export type AttachmentTarget = {
  entityType: string;
  entityId: string;
};

export type AttachmentMetadata = {
  filename: string;
  mimeType: string;
  size: number; // bytes
  storageKey: string;
  checksum?: string;
};

export type AttachmentRecord = {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  version: number;
  filename: string;
  mimeType: string;
  size: number;
  storageKey?: string;
  checksum?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AttachmentListResult = {
  supported: boolean;
  attachments: AttachmentRecord[];
  message?: string;
};

export type AttachmentCreateResult = {
  supported: boolean;
  attachment: AttachmentRecord | null;
  message?: string;
};

export type TenantContext = {
  tenantId: string;
  userId: string;
};

/**
 * Check if attachment functionality is supported.
 * Task 8 Gap Closure: Always returns true - Attachment model exists
 */
export async function getAttachmentSupport(): Promise<{ supported: boolean; reason?: string }> {
  const config = getAttachmentConfig();
  if (!config.enabled) {
    return {
      supported: false,
      reason: `Attachments not enabled: ${config.reason || "unknown"}`,
    };
  }

  return { supported: true };
}

/**
 * List attachments for a target entity.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listAttachmentsForTarget(
  tenantContext: TenantContext,
  target: AttachmentTarget
): Promise<AttachmentListResult> {
  try {
    const attachments = await prisma.attachment.findMany({
      where: {
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
        deletedAt: null, // Only non-deleted
      },
      orderBy: { createdAt: "desc" },
    });

    // Decrypt filenames
    const decryptedAttachments = await Promise.all(
      attachments.map(async (att) => ({
        id: att.id,
        tenantId: att.tenantId,
        entityType: att.entityType,
        entityId: att.entityId,
        version: att.version,
        filename: await maybeDecryptFilename(tenantContext.tenantId, att.filename),
        mimeType: att.mimeType,
        size: att.size,
        storageKey: buildObjectKey(tenantContext.tenantId, target.entityType, target.entityId, att.id),
        checksum: att.checksum || undefined,
        deletedAt: att.deletedAt,
        createdBy: att.uploadedBy || undefined,
        createdAt: att.createdAt,
        updatedAt: att.updatedAt,
      }))
    );

    return {
      supported: true,
      attachments: decryptedAttachments,
    };
  } catch (e: any) {
    return {
      supported: false,
      attachments: [],
      message: `Failed to list attachments: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get next version number for an attachment target.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getNextVersion(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<number> {
  try {
    const maxVersion = await prisma.attachment.aggregate({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      _max: {
        version: true,
      },
    });

    return (maxVersion._max?.version || 0) + 1;
  } catch {
    return 1;
  }
}

/**
 * Create attachment record in database.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function createAttachmentRecord(
  tenantContext: TenantContext,
  target: AttachmentTarget,
  metadata: AttachmentMetadata
): Promise<AttachmentCreateResult> {
  try {
    const version = await getNextVersion(tenantContext.tenantId, target.entityType, target.entityId);

    // Encrypt filename
    const encryptedFilename = await maybeEncryptFilename(tenantContext.tenantId, metadata.filename);

    const attachment = await prisma.attachment.create({
      data: {
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
        version,
        filename: encryptedFilename,
        mimeType: metadata.mimeType,
        size: metadata.size,
        checksum: metadata.checksum,
        uploadedBy: tenantContext.userId,
        status: "active",
      },
    });

    // Audit log
    try {
      await auditEvent("ATTACHMENT_CREATED", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        target: attachment.id,
        entityType: target.entityType,
        entityId: target.entityId,
        attachmentId: attachment.id,
        filename: metadata.filename,
        size: metadata.size,
        userId: tenantContext.userId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      attachment: {
        id: attachment.id,
        tenantId: attachment.tenantId,
        entityType: attachment.entityType,
        entityId: attachment.entityId,
        version: attachment.version,
        filename: metadata.filename, // Return decrypted filename
        mimeType: attachment.mimeType,
        size: attachment.size,
        storageKey: metadata.storageKey,
        checksum: attachment.checksum || undefined,
        deletedAt: attachment.deletedAt,
        createdBy: attachment.uploadedBy || undefined,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      attachment: null,
      message: `Failed to create attachment record: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Mark attachment as deleted (soft delete).
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function markAttachmentDeleted(
  tenantContext: TenantContext,
  attachmentId: string,
  reason?: string
): Promise<{ supported: boolean; message?: string }> {
  try {
    // Check if attachment exists and belongs to tenant
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        tenantId: tenantContext.tenantId,
      },
    });

    if (!attachment) {
      return {
        supported: false,
        message: "Attachment not found",
      };
    }

    // Soft delete
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        deletedAt: new Date(),
        status: "deleted",
      },
    });

    // Audit log
    try {
      await auditEvent("ATTACHMENT_DELETED", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        target: attachmentId,
        entityType: attachment.entityType,
        entityId: attachment.entityId,
        attachmentId,
        filename: attachment.filename,
        userId: tenantContext.userId,
        reason: reason || "user_requested",
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to delete attachment: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get attachment by ID.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getAttachment(
  tenantContext: TenantContext,
  attachmentId: string
): Promise<{ supported: boolean; attachment: AttachmentRecord | null; message?: string }> {
  try {
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        tenantId: tenantContext.tenantId,
        deletedAt: null,
      },
    });

    if (!attachment) {
      return {
        supported: true,
        attachment: null,
        message: "Attachment not found",
      };
    }

    // Decrypt filename
    const decryptedFilename = await maybeDecryptFilename(tenantContext.tenantId, attachment.filename);

    return {
      supported: true,
      attachment: {
        id: attachment.id,
        tenantId: attachment.tenantId,
        entityType: attachment.entityType,
        entityId: attachment.entityId,
        version: attachment.version,
        filename: decryptedFilename,
        mimeType: attachment.mimeType,
        size: attachment.size,
        storageKey: buildObjectKey(
          tenantContext.tenantId,
          attachment.entityType,
          attachment.entityId,
          attachment.id
        ),
        checksum: attachment.checksum || undefined,
        deletedAt: attachment.deletedAt,
        createdBy: attachment.uploadedBy || undefined,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      attachment: null,
      message: `Failed to get attachment: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Build audit payload for attachment operations.
 */
export function buildAttachmentAuditPayload(
  tenantContext: TenantContext,
  target: AttachmentTarget,
  attachmentId: string,
  filename: string,
  size: number,
  operation: "CREATE" | "DELETE" | "DOWNLOAD"
): Record<string, unknown> {
  return {
    tenantId: tenantContext.tenantId,
    actorId: tenantContext.userId,
    target: attachmentId,
    entityType: target.entityType,
    entityId: target.entityId,
    attachmentId,
    filename,
    size,
    userId: tenantContext.userId,
    operation,
  };
}
