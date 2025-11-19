/**
 * Phase 6 — Supplier Performance
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export interface SupplierPerformancePeriod {
  periodStart: Date;
  periodEnd: Date;
}

export async function getSupplierPerformance(
  scope: { tenantId: string; entityId?: string | null },
  supplierId?: string,
  period?: SupplierPerformancePeriod
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const where: any = {
    tenantId: scope.tenantId,
  };

  if (supplierId) {
    where.supplierId = supplierId;
  }

  if (period) {
    where.periodStart = { gte: period.periodStart };
    where.periodEnd = { lte: period.periodEnd };
  }

  const performances = await prisma.supplierPerformance.findMany({
    where,
    orderBy: { periodStart: "desc" },
    take: period ? undefined : 12, // Last 12 periods if no period specified
  });

  // Calculate aggregate metrics if multiple periods
  const aggregate = performances.reduce(
    (acc, perf) => {
      acc.totalOtif += Number(perf.otif);
      acc.totalQuality += Number(perf.quality);
      acc.count += 1;
      return acc;
    },
    { totalOtif: 0, totalQuality: 0, count: 0 }
  );

  return {
    ok: true,
    hasData: performances.length > 0,
    performances,
    aggregate: aggregate.count > 0
      ? {
          avgOtif: aggregate.totalOtif / aggregate.count,
          avgQuality: aggregate.totalQuality / aggregate.count,
        }
      : null,
  };
}

export async function recordSupplierPerformance(
  scope: { tenantId: string; entityId?: string | null },
  supplierId: string,
  periodStart: Date,
  periodEnd: Date,
  otif: number,
  quality: number,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify supplier exists
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, tenantId: scope.tenantId },
  });

  if (!supplier) {
    throw Object.assign(new Error("Supplier not found"), { code: 404 });
  }

  // Check if record exists
  const existing = await prisma.supplierPerformance.findFirst({
    where: {
      tenantId: scope.tenantId,
      supplierId,
      periodStart,
      periodEnd,
    },
  });

  const performance = existing
    ? await prisma.supplierPerformance.update({
        where: { id: existing.id },
        data: { otif, quality },
      })
    : await prisma.supplierPerformance.create({
        data: {
          tenantId: scope.tenantId,
          supplierId,
          periodStart,
          periodEnd,
          otif,
          quality,
        },
      });

  return performance;
}
