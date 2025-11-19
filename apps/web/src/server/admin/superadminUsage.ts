/**
 * Phase 27 — Super-Admin Usage Metrics
 *
 * Backend services for tenant usage metrics (read-only).
 */

import { prisma } from "@/lib/prisma";

export interface TenantUsageMetrics {
  tenantId: string;
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
  };
  modules: {
    invoices: number;
    purchaseOrders: number;
    workOrders: number;
    employees: number;
    inventoryItems: number;
    customers: number;
  };
  lastActivityAt: Date | null;
}

/**
 * Get usage metrics for a tenant
 */
export async function getTenantUsageMetrics(tenantId: string): Promise<TenantUsageMetrics> {
  // Users
  const totalUsers = await prisma.user.count({
    where: { tenantId },
  });
  const activeUsers = await prisma.user.count({
    where: { tenantId, active: true },
  });
  const inactiveUsers = totalUsers - activeUsers;

  // Subscriptions
  const totalSubscriptions = await prisma.subscription.count({
    where: { tenantId },
  });
  const activeSubscriptions = await prisma.subscription.count({
    where: { tenantId, status: { not: "cancelled" } },
  });
  const cancelledSubscriptions = await prisma.subscription.count({
    where: { tenantId, status: "cancelled" },
  });

  // Module usage (approximations)
  let invoices = 0;
  let purchaseOrders = 0;
  let workOrders = 0;
  let employees = 0;
  let inventoryItems = 0;
  let customers = 0;

  try {
    invoices = await prisma.customerInvoice.count({
      where: { tenantId },
    });
  } catch {
    // Model may not exist or have different structure
  }

  try {
    purchaseOrders = await prisma.purchaseOrder.count({
      where: { tenantId },
    });
  } catch {
    // Model may not exist
  }

  try {
    workOrders = await prisma.workOrder.count({
      where: { tenantId },
    });
  } catch {
    // Model may not exist
  }

  try {
    employees = await prisma.employee.count({
      where: { tenantId },
    });
  } catch {
    // Model may not exist
  }

  try {
    inventoryItems = await prisma.inventoryItem.count({
      where: { tenantId },
    });
  } catch {
    // Model may not exist
  }

  try {
    // Customers may be in a different model or not exist
    customers = 0; // Placeholder - adjust based on actual schema
  } catch {
    // Model may not exist
  }

  // Last activity (best-effort from audit log or updatedAt fields)
  let lastActivityAt: Date | null = null;
  try {
    const latestAudit = await prisma.auditLog.findFirst({
      where: { tenantId },
      orderBy: { at: "desc" },
      select: { at: true },
    });
    if (latestAudit) {
      lastActivityAt = latestAudit.at;
    }
  } catch {
    // Ignore errors
  }

  return {
    tenantId,
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    subscriptions: {
      total: totalSubscriptions,
      active: activeSubscriptions,
      cancelled: cancelledSubscriptions,
    },
    modules: {
      invoices,
      purchaseOrders,
      workOrders,
      employees,
      inventoryItems,
      customers,
    },
    lastActivityAt,
  };
}

