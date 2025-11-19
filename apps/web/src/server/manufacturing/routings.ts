import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listRoutings(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Safe subset: list work orders with counts of steps
  const wos = await prisma.workOrder.findMany({
    where: { tenantId: scope.tenantId },
    include: { steps: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return wos.map((w) => ({ id: w.id, number: w.number, itemCode: w.itemCode, status: w.status, stepCount: w.steps.length }));
}

export async function getRouting(scope: { tenantId: string; entityId?: string | null }, workOrderId: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const wo = await prisma.workOrder.findFirst({ where: { id: workOrderId, tenantId: scope.tenantId } });
  if (!wo) throw Object.assign(new Error("not_found"), { code: 404 });
  const steps = await prisma.routingStep.findMany({
    where: { tenantId: scope.tenantId, workOrderId },
    orderBy: { seq: "asc" },
  });
  return { workOrder: { id: wo.id, number: wo.number, itemCode: wo.itemCode, status: wo.status }, steps };
}

export async function createRouting() {
  // No routing master; routing steps are tied to WorkOrder
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}

export async function updateRouting() {
  throw Object.assign(new Error("not_implemented"), { code: 501 });
}


