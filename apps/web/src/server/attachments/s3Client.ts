/**
 * S3 Client Module
 * Provides S3 client and object key generation utilities.
 * Uses AWS SDK v3 (@aws-sdk/client-s3 and @aws-sdk/s3-request-presigner).
 */

import { S3Client } from "@aws-sdk/client-s3";
import { getAttachmentConfig } from "./config";

let s3ClientInstance: S3Client | null = null;

export type ObjectKeyParams = {
  tenantId: string;
  entityType: string;
  entityId: string;
  version: number;
  filename: string;
};

/**
 * Get S3 client instance (singleton).
 * Throws if attachments are not enabled or S3 config is missing.
 */
export function getS3Client(): S3Client {
  const config = getAttachmentConfig();

  if (!config.enabled) {
    throw new Error(`Attachments not enabled: ${config.reason || "unknown reason"}`);
  }

  if (!config.s3Bucket || !config.s3Region) {
    throw new Error("S3 bucket and region must be configured when attachments are enabled");
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: config.s3Region,
      // Credentials will be read from AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars
      // Or use IAM role if running on EC2/Lambda
    });
  }

  return s3ClientInstance;
}

/**
 * Build S3 object key with tenant-scoped prefix.
 * Format: tenants/{tenantId}/{entityType}/{entityId}/v{version}/{filename}
 *
 * Example: tenants/t-123/CustomerInvoice/inv-001/v1/invoice.pdf
 */
export function buildObjectKey(params: ObjectKeyParams): string {
  const { tenantId, entityType, entityId, version, filename } = params;

  // Sanitize filename to prevent path traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Build tenant-scoped key
  return `tenants/${tenantId}/${entityType}/${entityId}/v${version}/${safeFilename}`;
}

/**
 * Parse object key to extract components.
 * Returns null if key format is invalid.
 */
export function parseObjectKey(key: string): ObjectKeyParams | null {
  const parts = key.split("/");
  if (parts.length < 6 || parts[0] !== "tenants") {
    return null;
  }

  const versionMatch = parts[4]?.match(/^v(\d+)$/);
  if (!versionMatch) {
    return null;
  }

  return {
    tenantId: parts[1],
    entityType: parts[2],
    entityId: parts[3],
    version: parseInt(versionMatch[1], 10),
    filename: parts.slice(5).join("/"), // Handle filenames with slashes (shouldn't happen, but safe)
  };
}

