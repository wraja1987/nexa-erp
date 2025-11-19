import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function listSuppliers(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.supplier.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { code: "asc" },
    take: 500,
  });
}

export async function getSupplier(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const sup = await prisma.supplier.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!sup) throw Object.assign(new Error("not_found"), { code: 404 });
  return sup;
}

export async function createSupplier(
  scope: { tenantId: string; entityId?: string | null },
  data: { code: string; name: string; email?: string; phone?: string }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!data.code || !data.name) throw Object.assign(new Error("invalid_supplier"), { code: 400 });
  return prisma.supplier.create({
    data: {
      tenantId: scope.tenantId,
      code: data.code,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    },
  });
}

export async function updateSupplier(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  data: { name?: string; email?: string; phone?: string }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const sup = await prisma.supplier.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!sup) throw Object.assign(new Error("not_found"), { code: 404 });
  return prisma.supplier.update({
    where: { id },
    data: {
      name: data.name ?? sup.name,
      email: data.email ?? sup.email,
      phone: data.phone ?? sup.phone,
    },
  });
}


