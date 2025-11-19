import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";

export async function listCycleCountPlans(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Phase 5A: Use CycleCountPlan model
  return (prisma as any).cycleCountPlan.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCycleCountPlan(
  scope: { tenantId: string; entityId?: string | null },
  warehouseId: string,
  name: string,
  frequency: string,
  startDate: Date,
  endDate: Date,
  lines: Array<{ sku: string; locationId?: string | null }>,
  actorId: string
) {
  // Phase 5A: Use new cycle count service
  const { createCycleCountPlan: createPlan } = await import("@/server/wms/cyclecount");
  return createPlan(scope, warehouseId, name, frequency, startDate, endDate, lines, actorId);
}

export async function recordCycleCountResult(
  scope: { tenantId: string; entityId?: string | null },
  cycleCountLineId: string,
  countedQty: number,
  actorId: string
) {
  // Phase 5A: Use new cycle count service
  const { recordCycleCountResult: recordResult } = await import("@/server/wms/cyclecount");
  return recordResult(scope, cycleCountLineId, countedQty, actorId);
}

export async function calculateVariance(
  scope: { tenantId: string; entityId?: string | null },
  cycleCountLineId: string,
  actorId: string
) {
  // Phase 5A: Use new cycle count service to approve and post variance
  const { approveCycleCountVariance } = await import("@/server/wms/cyclecount");
  return approveCycleCountVariance(scope, cycleCountLineId, actorId);
}


