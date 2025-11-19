import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function getStockByBin(scope: { tenantId: string; entityId?: string | null }, opts?: { sku?: string }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Performance: Explicit select to avoid fetching unnecessary fields
  const items = await prisma.inventoryItem.findMany({
    where: {
      tenantId: scope.tenantId,
      ...(opts?.sku ? { sku: opts.sku } : {}),
    },
    select: {
      sku: true,
      warehouseId: true,
      locationId: true,
      qtyOnHand: true,
      warehouse: {
        select: {
          code: true,
        },
      },
      location: {
        select: {
          code: true,
        },
      },
    },
  });
  return items.map((i) => ({
    sku: i.sku,
    warehouseId: i.warehouseId,
    warehouseCode: (i as any).warehouse?.code || null,
    locationId: i.locationId,
    locationCode: (i as any).location?.code || null,
    qtyMinor: Number(i.qtyOnHand || 0),
  }));
}

export async function getStockSummary(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const items = await prisma.inventoryItem.findMany({
    where: { tenantId: scope.tenantId },
    select: { sku: true, warehouseId: true, qtyOnHand: true },
  });
  const byWarehouse: Record<string, number> = {};
  const byItem: Record<string, number> = {};
  for (const r of items) {
    const w = r.warehouseId || "UNASSIGNED";
    byWarehouse[w] = (byWarehouse[w] || 0) + Number(r.qtyOnHand || 0);
    byItem[r.sku] = (byItem[r.sku] || 0) + Number(r.qtyOnHand || 0);
  }
  return { byWarehouse, byItem };
}

export async function getItemStock(scope: { tenantId: string; entityId?: string | null }, sku: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const items = await prisma.inventoryItem.findMany({
    where: { tenantId: scope.tenantId, sku },
    select: { warehouseId: true, locationId: true, qtyOnHand: true },
  });
  const total = items.reduce((s, r) => s + Number(r.qtyOnHand || 0), 0);
  return { sku, total, breakdown: items };
}


