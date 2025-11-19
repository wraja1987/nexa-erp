import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type WarehouseInput = { code: string; name: string };

export async function listWarehouses(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.warehouse.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { code: "asc" },
  });
}

export async function createWarehouse(scope: { tenantId: string; entityId?: string | null }, data: WarehouseInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.warehouse.create({
    data: {
      tenantId: scope.tenantId,
      code: data.code,
      name: data.name,
    },
  });
}

export async function updateWarehouse(scope: { tenantId: string; entityId?: string | null }, id: string, data: { name?: string }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const wh = await prisma.warehouse.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!wh) throw Object.assign(new Error("not_found"), { code: 404 });
  return prisma.warehouse.update({
    where: { id },
    data: { name: data.name ?? wh.name },
  });
}


