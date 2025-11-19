import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type ItemFilters = {
  sku?: string;
  warehouseId?: string;
  locationId?: string;
};

export type ItemInput = {
  sku: string;
  warehouseId?: string | null;
  locationId?: string | null;
  initialQtyMinor?: number;
};

export async function listItems(scope: { tenantId: string; entityId?: string | null }, filters?: ItemFilters) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.inventoryItem.findMany({
    where: {
      tenantId: scope.tenantId,
      ...(filters?.sku ? { sku: filters.sku } : {}),
      ...(filters?.warehouse?._id ? { warehouseId: filters.warehouseId! } : {}),
      ...(filters?.locationId ? { locationId: filters.locationId } : {}),
    },
    include: { warehouse: true, location: true },
    orderBy: [{ sku: "asc" }, { warehouseId: "asc" }, { locationId: "asc" }],
  });
}

export async function getItem(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const item = await prisma.inventoryItem.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: { warehouse: true, location: true },
  });
  if (!item) throw Object.assign(new Error("not_found"), { code: 404 });
  return item;
}

export async function createItem(scope: { tenantId: string; entityId?: string | null }, data: ItemInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Validate warehouse/location ownership if provided
  if (data.warehouseId) {
    const wh = await prisma.warehouse.findFirst({ where: { id: data.warehouseId, tenantId: scope.tenantId } });
    if (!wh) throw Object.assign(new Error("invalid_warehouse"), { code: 400 });
  }
  if (data.locationId) {
    const loc = await prisma.location.findFirst({ where: { id: data.locationId, tenantId: scope.tenantId } });
    if (!loc) throw Object.assign(new Error("invalid_location"), { code: 400 });
  }
  return prisma.$transaction(async (tx) => {
    const created = await tx.inventoryItem.create({
      data: {
        tenantId: scope.tenantId,
        sku: data.sku,
        warehouseId: data.warehouseId || null,
        locationId: data.locationId || null,
        qtyOnHand: (data.initialQtyMinor ?? 0) as any,
      },
    });
    if ((data.initialQtyMinor || 0) > 0) {
      // Append a zero-cost lot to reflect inbound stock (no PO/ASN linkage available in schema)
      await tx.inventoryLot.create({
        data: {
          tenantId: scope.tenantId,
          sku: data.sku,
          qty: (data.initialQtyMinor as any) ?? 0,
          unitCost: 0 as any,
          receivedAt: new Date(),
          warehouseId: data.warehouseId || null,
          locationId: data.locationId || null,
        },
      });
    }
    return created;
  });
}

export async function updateItem(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  data: { sku?: string; warehouseId?: string | null; locationId?: string | null }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const current = await prisma.inventoryItem.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!current) throw Object.assign(new Error("not_found"), { code: 404 });
  if (data.warehouseId) {
    const wh = await prisma.warehouse.findFirst({ where: { id: data.warehouseId, tenantId: scope.tenantId } });
    if (!wh) throw Object.assign(new Error("invalid_warehouse"), { code: 400 });
  }
  if (data.locationId) {
    const loc = await prisma.location.findFirst({ where: { id: data.locationId, tenantId: scope.tenantId } });
    if (!loc) throw Object.assign(new Error("invalid_location"), { code: 400 });
  }
  return prisma.inventoryItem.update({
    where: { id: current.id },
    data: {
      sku: data.sku ?? current.sku,
      warehouseId: data.warehouseId ?? current.warehouseId,
      locationId: data.locationId ?? current.locationId,
      // Quantity changes must go via transfer/receiving endpoints (no direct qty edits to avoid hidden movements)
    },
  });
}


