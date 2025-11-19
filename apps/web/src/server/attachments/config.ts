/**
 * Attachment Configuration Module
 * Reads configuration from environment variables and validates required settings.
 */

export type AttachmentConfig = {
  enabled: boolean;
  reason?: string;
  s3Bucket?: string;
  s3Region?: string;
  maxSizeMB: number;
  allowedMimeTypes: string[];
};

// Default safe MIME type whitelist
const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",
  "text/plain",
  "application/json",
  "application/zip",
];

/**
 * Get attachment configuration from environment variables.
 * Returns enabled:false if NEXA_ATTACHMENTS_ENABLED is not set to "true".
 */
export function getAttachmentConfig(): AttachmentConfig {
  const enabled = process.env.NEXA_ATTACHMENTS_ENABLED === "true";

  if (!enabled) {
    return {
      enabled: false,
      reason: "NEXA_ATTACHMENTS_ENABLED is not set to 'true'",
      maxSizeMB: 20,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    };
  }

  // Validate required env vars when enabled
  const s3Bucket = process.env.NEXA_ATTACHMENTS_S3_BUCKET;
  const s3Region = process.env.NEXA_ATTACHMENTS_S3_REGION;

  if (!s3Bucket || !s3Region) {
    return {
      enabled: false,
      reason: "NEXA_ATTACHMENTS_S3_BUCKET and NEXA_ATTACHMENTS_S3_REGION must be set when attachments are enabled",
      maxSizeMB: 20,
      allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    };
  }

  // Parse optional config
  const maxSizeMB = parseInt(process.env.NEXA_ATTACHMENTS_MAX_SIZE_MB || "20", 10);
  const allowedMimeStr = process.env.NEXA_ATTACHMENTS_ALLOWED_MIME;
  const allowedMimeTypes = allowedMimeStr
    ? allowedMimeStr.split(",").map((m) => m.trim())
    : DEFAULT_ALLOWED_MIME_TYPES;

  return {
    enabled: true,
    s3Bucket,
    s3Region,
    maxSizeMB,
    allowedMimeTypes,
  };
}

