/**
 * BYOK Crypto Wrappers
 * Task 8 Gap Closure: Full DB-backed encryption using TenantKey model
 */

import { getTenantKey } from "./byokProvider";
import { BYOK_ENABLED } from "./byokConfig";
import { prisma } from "@/lib/prisma";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { captureError } from "@/server/observability/sentry";

export interface EncryptResult {
  supported: boolean;
  ciphertext?: string;
  algorithm?: string;
  keyId?: string;
  reason?: string;
}

export interface DecryptResult {
  supported: boolean;
  plaintext?: string;
  reason?: string;
}

/**
 * Encrypt plaintext for a tenant.
 * Task 8 Gap Closure: Full DB-backed implementation using TenantKey.keyMaterial
 */
export async function encryptForTenant(tenantId: string, plaintext: string | Buffer): Promise<EncryptResult> {
  // Check if BYOK is enabled
  if (!BYOK_ENABLED) {
    return {
      supported: false,
      reason: "BYOK not enabled",
    };
  }

  // Get tenant key
  const keyInfo = await getTenantKey(tenantId);
  if (!keyInfo.supported || !keyInfo.keyId) {
    return {
      supported: false,
      reason: keyInfo.reason || "Tenant key not available",
    };
  }

  try {
    // Get the key material from database
    const tenantKey = await prisma.tenantKey.findUnique({
      where: { id: keyInfo.keyId },
      select: { keyMaterial: true, algorithm: true },
    });

    if (!tenantKey) {
      return {
        supported: false,
        reason: "Key not found in database",
      };
    }

    const keyMaterial = Buffer.from(tenantKey.keyMaterial);
    const algorithm = tenantKey.algorithm || "aes-256-gcm";

    // For AES-GCM, we need a 12-byte IV
    const iv = randomBytes(12);
    const plaintextBuffer = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext, "utf8");

    // Create cipher
    const cipher = createCipheriv(algorithm, keyMaterial, iv);

    // Encrypt
    let ciphertext = cipher.update(plaintextBuffer);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);

    // Get auth tag (required for GCM)
    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + ciphertext and encode as base64
    const combined = Buffer.concat([iv, authTag, ciphertext]);
    const encryptedBase64 = combined.toString("base64");

    return {
      supported: true,
      ciphertext: encryptedBase64,
      algorithm,
      keyId: keyInfo.keyId,
    };
  } catch (error: any) {
    captureError(error, {
      module: "security",
      operation: "encrypt",
      tenantId,
    });

    return {
      supported: false,
      reason: `Encryption failed: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Decrypt ciphertext for a tenant.
 * Task 8 Gap Closure: Full DB-backed implementation using TenantKey.keyMaterial
 */
export async function decryptForTenant(
  tenantId: string,
  ciphertext: string | Buffer,
  metadata?: { algorithm?: string; keyId?: string }
): Promise<DecryptResult> {
  // Check if BYOK is enabled
  if (!BYOK_ENABLED) {
    // Assume plaintext if BYOK disabled
    return {
      supported: false,
      plaintext: Buffer.isBuffer(ciphertext) ? ciphertext.toString("utf8") : ciphertext,
      reason: "BYOK not enabled, assuming plaintext",
    };
  }

  // Get tenant key
  const keyInfo = await getTenantKey(tenantId);
  if (!keyInfo.supported || !keyInfo.keyId) {
    // Assume plaintext if no key
    return {
      supported: false,
      plaintext: Buffer.isBuffer(ciphertext) ? ciphertext.toString("utf8") : ciphertext,
      reason: keyInfo.reason || "Tenant key not available, assuming plaintext",
    };
  }

  try {
    // Get the key material from database
    const tenantKey = await prisma.tenantKey.findUnique({
      where: { id: keyInfo.keyId },
      select: { keyMaterial: true, algorithm: true },
    });

    if (!tenantKey) {
      return {
        supported: false,
        plaintext: Buffer.isBuffer(ciphertext) ? ciphertext.toString("utf8") : ciphertext,
        reason: "Key not found in database, assuming plaintext",
      };
    }

    const keyMaterial = Buffer.from(tenantKey.keyMaterial);
    const algorithm = tenantKey.algorithm || "aes-256-gcm";

    // Decode base64
    const combined = Buffer.from(ciphertext.toString(), "base64");

    // Extract IV (12 bytes), authTag (16 bytes), and ciphertext
    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const encryptedData = combined.subarray(28);

    // Create decipher
    const decipher = createDecipheriv(algorithm, keyMaterial, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let plaintext = decipher.update(encryptedData);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return {
      supported: true,
      plaintext: plaintext.toString("utf8"),
    };
  } catch (error: any) {
    // If decryption fails, assume it might be plaintext (backward compatibility)
    captureError(error, {
      module: "security",
      operation: "decrypt",
      tenantId,
    });

    return {
      supported: false,
      plaintext: Buffer.isBuffer(ciphertext) ? ciphertext.toString("utf8") : ciphertext,
      reason: `Decryption failed, assuming plaintext: ${error?.message || "unknown"}`,
    };
  }
}
