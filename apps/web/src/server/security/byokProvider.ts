/**
 * BYOK Key Provider Interface
 * Task 8 Gap Closure: Full DB-backed implementation using TenantKey model
 */

import { prisma } from "@/lib/prisma";
import { BYOK_ENABLED, BYOK_KEY_PROVIDER } from "./byokConfig";
import { publishWithOutbox } from "@/server/events/publisher";
import { auditEvent } from "@/lib/observability/audit";

export type TenantRegion = "UK" | "EU" | "GCC" | "US" | "UNKNOWN";

export interface TenantKeyInfo {
  supported: boolean;
  tenantId: string;
  region: TenantRegion;
  keyId?: string;
  provider?: string;
  version?: number;
  algorithm?: string;
  rotatedAt?: Date;
  createdAt?: Date;
  reason?: string;
}

export interface TenantKeyRecord {
  id: string;
  tenantId: string;
  version: number;
  algorithm: string;
  rotatedAt: Date;
  createdAt: Date;
}

/**
 * Get tenant region from database.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getTenantRegion(tenantId: string): Promise<TenantRegion> {
  try {
    // Try to read from TenantConfig.config JSON
    const config = await prisma.tenantConfig.findUnique({
      where: { tenantId },
      select: { config: true },
    });

    if (config?.config) {
      const configData = config.config as any;
      if (configData.region && ["UK", "EU", "GCC", "US"].includes(configData.region)) {
        return configData.region as TenantRegion;
      }
    }

    // Fallback: check environment variable (for single-tenant deployments)
    const envRegion = process.env.NEXA_DEFAULT_REGION;
    if (envRegion && ["UK", "EU", "GCC", "US"].includes(envRegion)) {
      return envRegion as TenantRegion;
    }

    return "UNKNOWN";
  } catch (e: any) {
    console.warn(`[BYOK] Failed to get tenant region for ${tenantId}:`, e?.message || String(e));
    return "UNKNOWN";
  }
}

/**
 * Get tenant encryption key information.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getTenantKey(tenantId: string): Promise<TenantKeyInfo> {
  const region = await getTenantRegion(tenantId);

  // Check if BYOK is enabled
  if (!BYOK_ENABLED) {
    return {
      supported: false,
      tenantId,
      region,
      reason: "BYOK not enabled (NEXA_BYOK_ENABLED=false)",
    };
  }

  // Check if provider is configured
  if (BYOK_KEY_PROVIDER === "none") {
    return {
      supported: false,
      tenantId,
      region,
      reason: "BYOK provider not configured (NEXA_BYOK_PROVIDER=none)",
    };
  }

  try {
    // Get the latest (highest version) key for the tenant
    const tenantKey = await prisma.tenantKey.findFirst({
      where: { tenantId },
      orderBy: { version: "desc" },
    });

    if (!tenantKey) {
      return {
        supported: false,
        tenantId,
        region,
        reason: "No key configured for tenant",
      };
    }

    return {
      supported: true,
      tenantId,
      region,
      keyId: tenantKey.id,
      provider: BYOK_KEY_PROVIDER,
      version: tenantKey.version,
      algorithm: tenantKey.algorithm,
      rotatedAt: tenantKey.rotatedAt,
      createdAt: tenantKey.createdAt,
    };
  } catch (e: any) {
    return {
      supported: false,
      tenantId,
      region,
      reason: `Failed to get tenant key: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * List all keys for a tenant.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listTenantKeys(tenantId: string): Promise<{
  supported: boolean;
  keys: TenantKeyRecord[];
  reason?: string;
}> {
  try {
    const keys = await prisma.tenantKey.findMany({
      where: { tenantId },
      orderBy: { version: "desc" },
      select: {
        id: true,
        tenantId: true,
        version: true,
        algorithm: true,
        rotatedAt: true,
        createdAt: true,
      },
    });

    return {
      supported: true,
      keys: keys.map((k) => ({
        id: k.id,
        tenantId: k.tenantId,
        version: k.version,
        algorithm: k.algorithm,
        rotatedAt: k.rotatedAt,
        createdAt: k.createdAt,
      })),
    };
  } catch (e: any) {
    return {
      supported: false,
      keys: [],
      reason: `Failed to list tenant keys: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Create a new tenant key.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function createTenantKey(
  tenantId: string,
  params: {
    keyMaterial: Buffer;
    algorithm?: string;
    actorId: string;
  }
): Promise<{
  supported: boolean;
  key?: TenantKeyRecord;
  reason?: string;
}> {
  try {
    // Check if BYOK is enabled
    if (!BYOK_ENABLED) {
      return {
        supported: false,
        reason: "BYOK not enabled",
      };
    }

    // Get current max version
    const maxVersion = await prisma.tenantKey.aggregate({
      where: { tenantId },
      _max: { version: true },
    });

    const nextVersion = (maxVersion._max?.version || 0) + 1;

    // Create new key
    const tenantKey = await prisma.tenantKey.create({
      data: {
        tenantId,
        version: nextVersion,
        keyMaterial: params.keyMaterial,
        algorithm: params.algorithm || "AES-256-GCM",
      },
      select: {
        id: true,
        tenantId: true,
        version: true,
        algorithm: true,
        rotatedAt: true,
        createdAt: true,
      },
    });

    // Audit log
    try {
      await auditEvent("security.byok.key.created", {
        tenantId,
        keyId: tenantKey.id,
        version: tenantKey.version,
        actorId: params.actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      key: {
        id: tenantKey.id,
        tenantId: tenantKey.tenantId,
        version: tenantKey.version,
        algorithm: tenantKey.algorithm,
        rotatedAt: tenantKey.rotatedAt,
        createdAt: tenantKey.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      reason: `Failed to create tenant key: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Rotate tenant key.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function rotateTenantKey(
  tenantId: string,
  newKeyMaterial: Buffer,
  actorId: string
): Promise<{
  supported: boolean;
  oldKey?: TenantKeyRecord;
  newKey?: TenantKeyRecord;
  reason?: string;
}> {
  try {
    // Get current active key
    const currentKey = await prisma.tenantKey.findFirst({
      where: { tenantId },
      orderBy: { version: "desc" },
    });

    if (!currentKey) {
      // No existing key, just create a new one
      const createResult = await createTenantKey(tenantId, {
        keyMaterial: newKeyMaterial,
        actorId,
      });

      if (!createResult.supported || !createResult.key) {
        return {
          supported: false,
          reason: createResult.reason || "Failed to create key",
        };
      }

      return {
        supported: true,
        newKey: createResult.key,
      };
    }

    // Create new key with incremented version
    const maxVersion = await prisma.tenantKey.aggregate({
      where: { tenantId },
      _max: { version: true },
    });

    const nextVersion = (maxVersion._max?.version || 0) + 1;

    const newKey = await prisma.tenantKey.create({
      data: {
        tenantId,
        version: nextVersion,
        keyMaterial: newKeyMaterial,
        algorithm: currentKey.algorithm,
      },
      select: {
        id: true,
        tenantId: true,
        version: true,
        algorithm: true,
        rotatedAt: true,
        createdAt: true,
      },
    });

    // Audit log
    try {
      await auditEvent("security.byok.key.rotated", {
        tenantId,
        oldKeyId: currentKey.id,
        newKeyId: newKey.id,
        oldVersion: currentKey.version,
        newVersion: newKey.version,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit event
    try {
      await publishWithOutbox({
        type: "security.byok.key.rotated",
        id: `byok-rotate-${Date.now()}`,
        tenantId,
        occurredAt: new Date().toISOString(),
        source: "security.byok",
        version: 1,
        payload: {
          tenantId,
          oldKeyId: currentKey.id,
          newKeyId: newKey.id,
          oldVersion: currentKey.version,
          newVersion: newKey.version,
          actorId,
        },
      });
    } catch (error) {
      // Ignore event errors
    }

    return {
      supported: true,
      oldKey: {
        id: currentKey.id,
        tenantId: currentKey.tenantId,
        version: currentKey.version,
        algorithm: currentKey.algorithm,
        rotatedAt: currentKey.rotatedAt,
        createdAt: currentKey.createdAt,
      },
      newKey,
    };
  } catch (e: any) {
    return {
      supported: false,
      reason: `Failed to rotate tenant key: ${e?.message || "unknown"}`,
    };
  }
}
