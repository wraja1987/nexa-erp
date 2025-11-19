/**
 * Phase 11 — ETL Snapshot Jobs
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { getAllKpis } from "@/server/analytics/kpi";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

type Scope = { tenantId: string; entityId?: string | null };

export async function runDailySnapshot(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const payload = await getAllKpis(scope);
  const snapshotAt = new Date();

  // Persist snapshot
  const snapshot = await prisma.metricsSnapshot.create({
    data: {
      tenantId: scope.tenantId,
      module: "all",
      snapshotAt,
      data: payload as any,
    },
  });

  return {
    type: "daily",
    at: snapshotAt.toISOString(),
    payload,
    persisted: { supported: true, snapshotId: snapshot.id },
  };
}

export async function runMonthlySnapshot(scope: Scope) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const payload = await getAllKpis(scope);
  const snapshotAt = new Date();

  // Persist snapshot
  const snapshot = await prisma.metricsSnapshot.create({
    data: {
      tenantId: scope.tenantId,
      module: "all",
      snapshotAt,
      data: payload as any,
    },
  });

  return {
    type: "monthly",
    at: snapshotAt.toISOString(),
    payload,
    persisted: { supported: true, snapshotId: snapshot.id },
  };
}

export async function runModuleSnapshot(
  scope: Scope,
  module: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Get module-specific KPIs
  const { getAllKpis } = await import("@/server/analytics/kpi");
  const allKpis = await getAllKpis(scope);
  const moduleKpis = (allKpis as any)[module] || {};

  const snapshotAt = new Date();

  // Persist snapshot
  const snapshot = await prisma.metricsSnapshot.create({
    data: {
      tenantId: scope.tenantId,
      module,
      snapshotAt,
      data: moduleKpis as any,
    },
  });

  return {
    type: "module",
    module,
    at: snapshotAt.toISOString(),
    payload: moduleKpis,
    persisted: { supported: true, snapshotId: snapshot.id },
  };
}

export async function getSnapshots(
  scope: Scope,
  module?: string,
  limit: number = 100
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const where: any = { tenantId: scope.tenantId };
  if (module) {
    where.module = module;
  }

  const snapshots = await prisma.metricsSnapshot.findMany({
    where,
    orderBy: { snapshotAt: "desc" },
    take: limit,
  });

  return { supported: true, data: snapshots };
}
