import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type BomFilters = { parentItemCode?: string };

export async function listBoms(scope: { tenantId: string; entityId?: string | null }, filters?: BomFilters) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Group by parent item to emulate BOM headers
  const lines = await prisma.bomItem.findMany({
    where: { tenantId: scope.tenantId, ...(filters?.parentItemCode ? { parentItemCode: filters.parentItemCode } : {}) },
    orderBy: [{ parentItemCode: "asc" }, { componentItemCode: "asc" }],
  });
  const byParent = new Map<string, Array<typeof lines[number]>>();
  for (const l of lines) {
    const arr = byParent.get(l.parentItemCode) || [];
    arr.push(l);
    byParent.set(l.parentItemCode, arr);
  }
  return Array.from(byParent.entries()).map(([parentItemCode, components]) => ({
    parentItemCode,
    components,
  }));
}

export async function getBom(scope: { tenantId: string; entityId?: string | null }, parentItemCode: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const components = await prisma.bomItem.findMany({
    where: { tenantId: scope.tenantId, parentItemCode },
    orderBy: { componentItemCode: "asc" },
  });
  return { parentItemCode, components };
}

export type BomComponentInput = { componentItemCode: string; quantityMinor: number };
export async function createBom(
  scope: { tenantId: string; entityId?: string | null },
  data: { parentItemCode: string; components: BomComponentInput[] }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!data.parentItemCode || !data.components?.length) throw Object.assign(new Error("invalid_bom"), { code: 400 });
  return prisma.$transaction(async (tx) => {
    const created = [];
    for (const c of data.components) {
      const row = await tx.bomItem.create({
        data: {
          tenantId: scope.tenantId,
          parentItemCode: data.parentItemCode,
          componentItemCode: c.componentItemCode,
          quantity: (c.quantityMinor as any) ?? 0,
        },
      });
      created.push(row);
    }
    return { parentItemCode: data.parentItemCode, components: created };
  });
}

export async function updateBom(
  scope: { tenantId: string; entityId?: string | null },
  data: { parentItemCode: string; components: BomComponentInput[] }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!data.parentItemCode || !data.components?.length) throw Object.assign(new Error("invalid_bom"), { code: 400 });
  // Safe subset: upsert each component quantity; no deletions in this pass
  return prisma.$transaction(async (tx) => {
    const updated = [];
    for (const c of data.components) {
      const existing = await tx.bomItem.findFirst({
        where: {
          tenantId: scope.tenantId,
          parentItemCode: data.parentItemCode,
          componentItemCode: c.componentItemCode,
        },
      });
      if (existing) {
        updated.push(
          await tx.bomItem.update({
            where: { id: existing.id },
            data: { quantity: (c.quantityMinor as any) },
          })
        );
      } else {
        updated.push(
          await tx.bomItem.create({
            data: {
              tenantId: scope.tenantId,
              parentItemCode: data.parentItemCode,
              componentItemCode: c.componentItemCode,
              quantity: (c.quantityMinor as any),
            },
          })
        );
      }
    }
    return { parentItemCode: data.parentItemCode, components: updated };
  });
}


