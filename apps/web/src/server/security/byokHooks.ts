/**
 * BYOK Encryption Hooks
 * Task 8 Gap Closure: Full DB-backed implementation
 * Helper functions for field-level encryption that return plaintext when BYOK is disabled or no key exists.
 * These hooks activate when BYOK is enabled and tenant keys are available.
 */

import { encryptForTenant, decryptForTenant } from "./byokCrypto";

/**
 * Encrypt bank account number (NOOP when unsupported).
 * Returns plaintext unchanged when encryption is not supported.
 */
export async function maybeEncryptBankAccount(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    // BYOK disabled or no key: return plaintext unchanged
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt bank account number (NOOP when unsupported).
 * Returns ciphertext unchanged when decryption is not supported (assumes plaintext).
 */
export async function maybeDecryptBankAccount(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    // BYOK disabled or no key: return ciphertext as-is (assume it's plaintext for backward compatibility)
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt IBAN (NOOP when unsupported).
 */
export async function maybeEncryptIBAN(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt IBAN (NOOP when unsupported).
 */
export async function maybeDecryptIBAN(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt sort code (NOOP when unsupported).
 */
export async function maybeEncryptSortCode(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt sort code (NOOP when unsupported).
 */
export async function maybeDecryptSortCode(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt National Insurance number (NOOP when unsupported).
 */
export async function maybeEncryptNI(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt National Insurance number (NOOP when unsupported).
 */
export async function maybeDecryptNI(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt address (NOOP when unsupported).
 */
export async function maybeEncryptAddress(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt address (NOOP when unsupported).
 */
export async function maybeDecryptAddress(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt filename (NOOP when unsupported).
 * Used for attachment filenames that may contain PII.
 */
export async function maybeEncryptFilename(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt filename (NOOP when unsupported).
 */
export async function maybeDecryptFilename(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt email (NOOP when unsupported).
 */
export async function maybeEncryptEmail(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt email (NOOP when unsupported).
 */
export async function maybeDecryptEmail(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

/**
 * Encrypt phone number (NOOP when unsupported).
 */
export async function maybeEncryptPhone(tenantId: string, plain: string): Promise<string> {
  const result = await encryptForTenant(tenantId, plain);
  if (!result.supported || !result.ciphertext) {
    return plain;
  }
  return result.ciphertext;
}

/**
 * Decrypt phone number (NOOP when unsupported).
 */
export async function maybeDecryptPhone(tenantId: string, ciphertext: string): Promise<string> {
  const result = await decryptForTenant(tenantId, ciphertext);
  if (!result.supported || !result.plaintext) {
    return ciphertext;
  }
  return result.plaintext;
}

