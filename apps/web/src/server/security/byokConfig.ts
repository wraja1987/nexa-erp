/**
 * BYOK Configuration
 * Centralizes BYOK environment variable configuration.
 */

export const BYOK_ENABLED = process.env.NEXA_BYOK_ENABLED === "true";
export const BYOK_KEY_PROVIDER = (process.env.NEXA_BYOK_PROVIDER || "none") as
  | "aws-kms"
  | "azure-keyvault"
  | "gcp-kms"
  | "local"
  | "none";

// Provider-specific configuration
export const AWS_KMS_KEY_ID = process.env.AWS_KMS_KEY_ID;
export const AWS_KMS_REGION = process.env.AWS_KMS_REGION || "eu-west-2";

export const AZURE_KEY_VAULT_URL = process.env.AZURE_KEY_VAULT_URL;
export const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
export const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

export const GCP_KMS_KEY_RING = process.env.GCP_KMS_KEY_RING;
export const GCP_KMS_KEY_NAME = process.env.GCP_KMS_KEY_NAME;
export const GCP_KMS_LOCATION = process.env.GCP_KMS_LOCATION || "europe-west2";

/**
 * Validate BYOK configuration.
 * Emits warnings if configuration is inconsistent.
 */
export function validateByokConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (BYOK_ENABLED && BYOK_KEY_PROVIDER === "none") {
    warnings.push("BYOK is enabled but no provider is configured. Set NEXA_BYOK_PROVIDER.");
  }

  if (BYOK_ENABLED && BYOK_KEY_PROVIDER === "aws-kms" && !AWS_KMS_KEY_ID) {
    warnings.push("AWS KMS provider selected but AWS_KMS_KEY_ID is not set.");
  }

  if (BYOK_ENABLED && BYOK_KEY_PROVIDER === "azure-keyvault" && !AZURE_KEY_VAULT_URL) {
    warnings.push("Azure Key Vault provider selected but AZURE_KEY_VAULT_URL is not set.");
  }

  if (BYOK_ENABLED && BYOK_KEY_PROVIDER === "gcp-kms" && (!GCP_KMS_KEY_RING || !GCP_KMS_KEY_NAME)) {
    warnings.push("GCP KMS provider selected but GCP_KMS_KEY_RING or GCP_KMS_KEY_NAME is not set.");
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn("[BYOK] Configuration warnings:", warnings);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

// Validate on module load
if (BYOK_ENABLED) {
  validateByokConfig();
}

