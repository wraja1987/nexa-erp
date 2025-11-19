/**
 * Phase 27 — Super-Admin Tenant Management
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { getTenantKey } from "@/server/security/byokProvider";
import { getTenantRegion } from "@/server/security/byokProvider";
import { BYOK_ENABLED, BYOK_KEY_PROVIDER } from "@/server/security/byokConfig";
import { auditEvent } from "@/lib/observability/audit";

export interface TenantSummary {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "suspended";
  userCount: number;
  subscriptionCount: number;
  lastLoginAt: Date | null;
}

export interface TenantDetail extends TenantSummary {
  byokStatus: {
    enabled: boolean;
    provider: string;
    supported: boolean;
    reason?: string;
  };
  dataResidencyStatus: {
    region: string;
    supported: boolean;
    reason?: string;
  };
}

/**
 * List all tenants with summary metrics
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listTenantsWithSummary(): Promise<TenantSummary[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const summaries: TenantSummary[] = [];

  for (const tenant of tenants) {
    // Count users
    const userCount = await prisma.user.count({
      where: { tenantId: tenant.id },
    });

    // Count active subscriptions
    const subscriptionCount = await prisma.subscription.count({
      where: {
        tenantId: tenant.id,
        status: { not: "cancelled" },
      },
    });

    // Get last login (best-effort from sessions)
    let lastLoginAt: Date | null = null;
    try {
      const latestSession = await prisma.session.findFirst({
        where: {
          user: {
            tenantId: tenant.id,
          },
        },
        orderBy: { expires: "desc" },
        select: { expires: true },
      });
      if (latestSession) {
        lastLoginAt = latestSession.expires;
      }
    } catch {
      // Ignore errors - last login is best-effort
    }

    // Get status from Tenant model
    const status: "active" | "suspended" = tenant.status === "suspended" ? "suspended" : "active";

    summaries.push({
      id: tenant.id,
      name: tenant.name,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      status,
      userCount,
      subscriptionCount,
      lastLoginAt,
    });
  }

  return summaries;
}

/**
 * Get detailed tenant information including BYOK and residency status
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getTenantDetail(tenantId: string): Promise<TenantDetail | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    return null;
  }

  // Get summary
  const userCount = await prisma.user.count({
    where: { tenantId },
  });

  const subscriptionCount = await prisma.subscription.count({
    where: {
      tenantId,
      status: { not: "cancelled" },
    },
  });

  let lastLoginAt: Date | null = null;
  try {
    const latestSession = await prisma.session.findFirst({
      where: {
        user: {
          tenantId,
        },
      },
      orderBy: { expires: "desc" },
      select: { expires: true },
    });
    if (latestSession) {
      lastLoginAt = latestSession.expires;
    }
  } catch {
    // Ignore errors
  }

  const status: "active" | "suspended" = tenant.status === "suspended" ? "suspended" : "active";

  // Get BYOK status
  const tenantKey = await getTenantKey(tenantId);
  const byokStatus = {
    enabled: BYOK_ENABLED,
    provider: BYOK_KEY_PROVIDER,
    supported: tenantKey.supported,
    reason: tenantKey.reason,
  };

  // Get data residency status
  const region = await getTenantRegion(tenantId);
  const dataResidencyStatus = {
    region,
    supported: region !== "UNKNOWN",
    reason: region === "UNKNOWN" ? "Tenant region not configured" : undefined,
  };

  return {
    id: tenant.id,
    name: tenant.name,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    status,
    userCount,
    subscriptionCount,
    lastLoginAt,
    byokStatus,
    dataResidencyStatus,
  };
}

/**
 * Suspend tenant
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function suspendTenant(tenantId: string, actorId: string): Promise<{ supported: boolean; reason?: string }> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        supported: false,
        reason: "Tenant not found",
      };
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "suspended" },
    });

    // Audit log
    try {
      await auditEvent("admin.tenant.suspended", {
        tenantId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (error: any) {
    return {
      supported: false,
      reason: String(error?.message || "Failed to suspend tenant"),
    };
  }
}

/**
 * Activate tenant
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function activateTenant(tenantId: string, actorId: string): Promise<{ supported: boolean; reason?: string }> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        supported: false,
        reason: "Tenant not found",
      };
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: "active" },
    });

    // Audit log
    try {
      await auditEvent("admin.tenant.activated", {
        tenantId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return { supported: true };
  } catch (error: any) {
    return {
      supported: false,
      reason: String(error?.message || "Failed to activate tenant"),
    };
  }
}
