import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type BinInput = { warehouseId: string; code: string; type?: string | null };

export async function listBins(scope: { tenantId: string; entityId?: string | null }, warehouseId?: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.location.findMany({
    where: { tenantId: scope.tenantId, ...(warehouseId ? { warehouseId } : {}) },
    include: { warehouse: true },
    orderBy: [{ warehouseId: "asc" }, { code: "asc" }],
  });
}

export async function createBin(scope: { tenantId: string; entityId?: string | null }, data: BinInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const wh = await prisma.warehouse.findFirst({ where: { id: data.warehouseId, tenantId: scope.tenantId } });
  if (!wh) throw Object.assign(new Error("invalid_warehouse"), { code: 400 });
  return prisma.location.create({
    data: {
      tenantId: scope.tenantId,
      warehouseId: data.warehouseId,
      code: data.code,
      type: data.type ?? null,
    },
  });
}

export async function updateBin(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  data: { code?: string; type?: string | null }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const loc = await prisma.location.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!loc) throw Object.assign(new Error("not_found"), { code: 404 });
  return prisma.location.update({
    where: { id },
    data: {
      code: data.code ?? loc.code,
      type: data.type ?? loc.type,
    },
  });
}


