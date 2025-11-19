/**
 * S3 Delete Operations
 * 
 * Handles deletion of attachment files from S3 (hard delete).
 * Note: Database soft delete is handled in service.ts
 */

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getAttachmentConfig } from "./config";
import { getS3Client } from "./s3Client";
import { buildObjectKey } from "./s3Client";
import { getAttachment } from "./service";
import type { TenantContext } from "./service";

export interface DeleteAttachmentResult {
  supported: boolean;
  deleted: boolean;
  message?: string;
}

/**
 * Delete attachment file from S3
 * Note: Database record should be soft-deleted separately via markAttachmentDeleted
 */
export async function deleteAttachmentFromS3(
  tenantContext: TenantContext,
  attachmentId: string
): Promise<DeleteAttachmentResult> {
  const config = getAttachmentConfig();
  if (!config.enabled) {
    return {
      supported: false,
      deleted: false,
      message: `Attachments not enabled: ${config.reason || "unknown"}`,
    };
  }

  // Load attachment record
  const { supported, attachment, message } = await getAttachment(tenantContext, attachmentId);

  if (!supported || !attachment) {
    return {
      supported: false,
      deleted: false,
      message: message || "Attachment not found",
    };
  }

  try {
    // Build storage key
    const storageKey = buildObjectKey({
      tenantId: tenantContext.tenantId,
      entityType: attachment.entityType,
      entityId: attachment.entityId,
      version: attachment.version,
      filename: attachment.filename,
    });

    // Delete from S3
    const s3Client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: config.s3Bucket!,
      Key: storageKey,
    });

    await s3Client.send(command);

    return {
      supported: true,
      deleted: true,
    };
  } catch (e: any) {
    return {
      supported: true,
      deleted: false,
      message: `Failed to delete from S3: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Delete all versions of an attachment (if versioning enabled)
 */
export async function deleteAllAttachmentVersions(
  tenantContext: TenantContext,
  attachmentId: string
): Promise<DeleteAttachmentResult> {
  const config = getAttachmentConfig();
  if (!config.enabled) {
    return {
      supported: false,
      deleted: false,
      message: `Attachments not enabled: ${config.reason || "unknown"}`,
    };
  }

  // Load attachment record
  const { supported, attachment, message } = await getAttachment(tenantContext, attachmentId);

  if (!supported || !attachment) {
    return {
      supported: false,
      deleted: false,
      message: message || "Attachment not found",
    };
  }

  try {
    // Build base storage key (without version)
    const baseKey = `tenants/${tenantContext.tenantId}/${attachment.entityType}/${attachment.entityId}`;
    
    // List all versions with this prefix
    const s3Client = getS3Client();
    const { ListObjectVersionsCommand } = await import("@aws-sdk/client-s3");
    const listCommand = new ListObjectVersionsCommand({
      Bucket: config.s3Bucket!,
      Prefix: baseKey,
    });

    const listResult = await s3Client.send(listCommand);
    const versionsToDelete = [
      ...(listResult.Versions || []).filter(
        (v) => v.Key?.includes(attachment.filename)
      ),
      ...(listResult.DeleteMarkers || []).filter(
        (v) => v.Key?.includes(attachment.filename)
      ),
    ];

    // Delete all versions
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    for (const version of versionsToDelete) {
      if (version.Key && version.VersionId) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: config.s3Bucket!,
          Key: version.Key,
          VersionId: version.VersionId,
        });
        await s3Client.send(deleteCommand);
      }
    }

    return {
      supported: true,
      deleted: true,
    };
  } catch (e: any) {
    // If versioning not enabled, fall back to simple delete
    return deleteAttachmentFromS3(tenantContext, attachmentId);
  }
}

