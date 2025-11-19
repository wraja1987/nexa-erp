/**
 * Pre-Signed URL Generation Module
 * Generates S3 pre-signed URLs for upload and download operations.
 */

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, buildObjectKey } from "./s3Client";
import { getAttachmentConfig } from "./config";
import {
  getAttachmentSupport,
  getNextVersion,
  createAttachmentRecord,
  getAttachment,
} from "./service";
import { auditEvent } from "@/lib/observability/audit";
import type { TenantContext, AttachmentTarget } from "./service";

export type UploadUrlResult = {
  supported: boolean;
  uploadUrl?: string;
  storageKey?: string;
  version?: number;
  headers?: Record<string, string>;
  message?: string;
};

export type DownloadUrlResult = {
  supported: boolean;
  downloadUrl?: string;
  filename?: string;
  mimeType?: string;
  message?: string;
};

/**
 * Generate pre-signed upload URL.
 * Validates config, RBAC, size, MIME type, and generates S3 pre-signed PUT URL.
 * Returns 501 if Attachment model is missing (cannot create DB record).
 */
export async function getUploadUrl(
  tenantContext: TenantContext,
  target: AttachmentTarget,
  filename: string,
  mimeType: string,
  size: number
): Promise<UploadUrlResult> {
  // Check if attachments are enabled
  const config = getAttachmentConfig();
  if (!config.enabled) {
    return {
      supported: false,
      message: `Attachments not enabled: ${config.reason || "unknown"}`,
    };
  }

  // Validate size
  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (size > maxSizeBytes) {
    return {
      supported: false,
      message: `File size ${size} bytes exceeds maximum ${maxSizeBytes} bytes (${config.maxSizeMB} MB)`,
    };
  }

  // Validate MIME type
  if (!config.allowedMimeTypes.includes(mimeType)) {
    return {
      supported: false,
      message: `MIME type ${mimeType} is not allowed. Allowed types: ${config.allowedMimeTypes.join(", ")}`,
    };
  }

  // Check if Attachment model exists (required for DB record creation)
  const support = await getAttachmentSupport();
  if (!support.supported) {
    return {
      supported: false,
      message: support.reason || "Schema gap: No Attachment model. Cannot create attachment records.",
    };
  }

  try {
    // Get next version
    const version = await getNextVersion(tenantContext.tenantId, target.entityType, target.entityId);

    // Build storage key
    const storageKey = buildObjectKey({
      tenantId: tenantContext.tenantId,
      entityType: target.entityType,
      entityId: target.entityId,
      version,
      filename,
    });

    // Generate pre-signed PUT URL (expires in 1 hour)
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: config.s3Bucket!,
      Key: storageKey,
      ContentType: mimeType,
      ContentLength: size,
      // Add metadata
      Metadata: {
        tenantId: tenantContext.tenantId,
        entityType: target.entityType,
        entityId: target.entityId,
        version: version.toString(),
        uploadedBy: tenantContext.userId,
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Log debug event (no secrets in logs)
    await auditEvent("ATTACHMENT_UPLOAD_URL_GENERATED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: storageKey,
      entityType: target.entityType,
      entityId: target.entityId,
      filename,
      size,
    });

    return {
      supported: true,
      uploadUrl,
      storageKey,
      version,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": size.toString(),
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to generate upload URL: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Generate pre-signed download URL.
 * Validates tenant + RBAC, loads attachment record, and generates S3 pre-signed GET URL.
 * Returns 404/501 if Attachment model is missing or attachment not found.
 */
export async function getDownloadUrl(
  tenantContext: TenantContext,
  attachmentId: string
): Promise<DownloadUrlResult> {
  // Check if attachments are enabled
  const config = getAttachmentConfig();
  if (!config.enabled) {
    return {
      supported: false,
      message: `Attachments not enabled: ${config.reason || "unknown"}`,
    };
  }

  // Load attachment record
  const { supported, attachment, message } = await getAttachment(tenantContext, attachmentId);

  if (!supported) {
    return {
      supported: false,
      message: message || "Schema gap: No Attachment model. Cannot load attachment records.",
    };
  }

  if (!attachment) {
    return {
      supported: false,
      message: "Attachment not found",
    };
  }

  try {
    // Build storage key from attachment data
    const storageKey = buildObjectKey({
      tenantId: tenantContext.tenantId,
      entityType: attachment.entityType,
      entityId: attachment.entityId,
      version: attachment.version,
      filename: attachment.filename,
    });

    // Generate pre-signed GET URL (expires in 15 minutes)
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: config.s3Bucket!,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${attachment.filename}"`,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    // Log download event (debug-level, sampled)
    if (Math.random() < 0.1) {
      // Sample 10% of downloads
      await auditEvent("ATTACHMENT_DOWNLOADED", {
        tenantId: tenantContext.tenantId,
        actorId: tenantContext.userId,
        target: attachmentId,
        attachmentId,
        filename: attachment.filename,
        userId: tenantContext.userId,
      });
    }

    return {
      supported: true,
      downloadUrl,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
    };
  } catch (e: any) {
    return {
      supported: false,
      message: `Failed to generate download URL: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Complete attachment upload (create DB record after successful S3 upload).
 * Called by client after uploading file to S3 using pre-signed URL.
 */
export async function completeAttachmentUpload(
  tenantContext: TenantContext,
  target: AttachmentTarget,
  storageKey: string,
  filename: string,
  mimeType: string,
  size: number,
  checksum?: string
): Promise<{ supported: boolean; attachment: any; message?: string }> {
  const support = await getAttachmentSupport();
  if (!support.supported) {
    return {
      supported: false,
      attachment: null,
      message: support.reason || "Schema gap: No Attachment model. Cannot create attachment records.",
    };
  }

  return await createAttachmentRecord(tenantContext, target, {
    filename,
    mimeType,
    size,
    storageKey,
    checksum,
  });
}

