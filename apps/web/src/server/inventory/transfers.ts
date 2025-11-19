import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { InventoryTransferCreated } from "@/server/events/types";
import { incrementCounter, recordDuration } from "@/server/observability/metrics";
import { captureError } from "@/server/observability/sentry";

export type WarehouseTransferInput = {
  sku: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantityMinor: number;
  actorId: string;
};

export type BinTransferInput = {
  sku: string;
  warehouseId: string;
  fromLocationId: string;
  toLocationId: string;
  quantityMinor: number;
  actorId: string;
};

export async function createWarehouseTransfer(scope: { tenantId: string; entityId?: string | null }, input: WarehouseTransferInput) {
  const start = Date.now();
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (input.quantityMinor <= 0) throw Object.assign(new Error("invalid_quantity"), { code: 400 });
  const [fromWh, toWh] = await Promise.all([
    prisma.warehouse.findFirst({ where: { id: input.fromWarehouseId, tenantId: scope.tenantId } }),
    prisma.warehouse.findFirst({ where: { id: input.toWarehouseId, tenantId: scope.tenantId } }),
  ]);
  if (!fromWh || !toWh) throw Object.assign(new Error("invalid_warehouse"), { code: 400 });
  if (fromWh.id === toWh.id) throw Object.assign(new Error("same_warehouse"), { code: 400 });
  return prisma.$transaction(async (tx) => {
    const src = await tx.inventoryItem.findFirst({
      where: { tenantId: scope.tenantId, sku: input.sku, warehouseId: input.fromWarehouseId, locationId: null },
    });
    if (!src || Number(src.qtyOnHand) < input.quantityMinor) throw Object.assign(new Error("insufficient_stock"), { code: 409 });
    const newSrcQty = Number(src.qtyOnHand) - input.quantityMinor;
    await tx.inventoryItem.update({ where: { id: src.id }, data: { qtyOnHand: newSrcQty as any } });
    await tx.inventoryItem.upsert({
      where: { id: await ensureItemId(tx, scope.tenantId, input.sku, input.toWarehouseId, null) },
      update: { qtyOnHand: { increment: input.quantityMinor as any } },
      create: {
        tenantId: scope.tenantId,
        sku: input.sku,
        warehouseId: input.toWarehouseId,
        locationId: null,
        qtyOnHand: input.quantityMinor as any,
      },
    });
    await tx.inventoryLot.create({
      data: {
        tenantId: scope.tenantId,
        sku: input.sku,
        qty: input.quantityMinor as any,
        unitCost: 0 as any,
        receivedAt: new Date(),
        warehouseId: input.toWarehouseId,
        locationId: null,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: scope.tenantId,
        actorId: input.actorId,
        action: "inventory.transfer.warehouse",
        target: `WH:${input.fromWarehouseId}->${input.toWarehouseId}`,
        at: new Date(),
        data: {
          sku: input.sku,
          quantity: input.quantityMinor,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
        } as any,
      },
    });
    const result = { ok: true, fromWarehouse: fromWh, toWarehouse: toWh, sku: input.sku, quantity: input.quantityMinor };
    return result;
  });

  // Publish event (after transaction completes)
  try {
    const event: InventoryTransferCreated = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "inventory.transfer.created",
      occurredAt: nowIso(),
      source: "inventory.transfer",
      version: 1,
      payload: {
        transferId: `transfer-${Date.now()}`,
        fromWarehouseCode: result.fromWarehouse.code,
        toWarehouseCode: result.toWarehouse.code,
        sku: result.sku,
        quantity: result.quantity,
        createdAt: nowIso(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[Inventory] Failed to publish transfer.created event:`, error);
  }

  return { ok: true };
}

export async function createBinTransfer(scope: { tenantId: string; entityId?: string | null }, input: BinTransferInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (input.quantityMinor <= 0) throw Object.assign(new Error("invalid_quantity"), { code: 400 });
  const [fromLoc, toLoc] = await Promise.all([
    prisma.location.findFirst({ where: { id: input.fromLocationId, tenantId: scope.tenantId } }),
    prisma.location.findFirst({ where: { id: input.toLocationId, tenantId: scope.tenantId } }),
  ]);
  if (!fromLoc || !toLoc) throw Object.assign(new Error("invalid_location"), { code: 400 });
  if (fromLoc.warehouseId !== input.warehouseId || toLoc.warehouseId !== input.warehouseId) {
    throw Object.assign(new Error("location_warehouse_mismatch"), { code: 400 });
  }
  if (input.fromLocationId === input.toLocationId) throw Object.assign(new Error("same_location"), { code: 400 });
  return prisma.$transaction(async (tx) => {
    const src = await tx.inventoryItem.findFirst({
      where: { tenantId: scope.tenantId, sku: input.sku, warehouseId: input.warehouseId, locationId: input.fromLocationId },
    });
    if (!src || Number(src.qtyOnHand) < input.quantityMinor) throw Object.assign(new Error("insufficient_stock"), { code: 409 });
    await tx.inventoryItem.update({
      where: { id: src.id },
      data: { qtyOnHand: (Number(src.qtyOnHand) - input.quantityMinor) as any },
    });
    await tx.inventoryItem.upsert({
      where: { id: await ensureItemId(tx, scope.tenantId, input.sku, input.warehouseId, input.toLocationId) },
      update: { qtyOnHand: { increment: input.quantityMinor as any } },
      create: {
        tenantId: scope.tenantId,
        sku: input.sku,
        warehouseId: input.warehouseId,
        locationId: input.toLocationId,
        qtyOnHand: input.quantityMinor as any,
      },
    });
    await tx.inventoryLot.create({
      data: {
        tenantId: scope.tenantId,
        sku: input.sku,
        qty: input.quantityMinor as any,
        unitCost: 0 as any,
        receivedAt: new Date(),
        warehouseId: input.warehouseId,
        locationId: input.toLocationId,
      },
    });
    await tx.auditLog.create({
      data: {
        tenantId: scope.tenantId,
        actorId: input.actorId,
        action: "inventory.transfer.bin",
        target: `WH:${input.warehouseId} ${input.fromLocationId}->${input.toLocationId}`,
        at: new Date(),
        data: {
          sku: input.sku,
          quantity: input.quantityMinor,
          warehouseId: input.warehouseId,
          fromLocationId: input.fromLocationId,
          toLocationId: input.toLocationId,
        } as any,
      },
    });
    return { ok: true };
  });
}

export async function listTransfers(scope: { tenantId: string; entityId?: string | null }, opts?: { kind?: "warehouse" | "bin" }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const actions =
    opts?.kind === "warehouse"
      ? ["inventory.transfer.warehouse"]
      : opts?.kind === "bin"
      ? ["inventory.transfer.bin"]
      : ["inventory.transfer.warehouse", "inventory.transfer.bin"];
  return prisma.auditLog.findMany({
    where: { tenantId: scope.tenantId, action: { in: actions } },
    orderBy: { at: "desc" },
    take: 200,
  });
}

async function ensureItemId(
  tx: Parameters<typeof prisma.$transaction>[0],
  tenantId: string,
  sku: string,
  warehouseId: string | null,
  locationId: string | null
): Promise<string> {
  const found = await (tx as any).inventoryItem.findFirst({ where: { tenantId, sku, warehouseId, locationId } });
  if (found) return found.id;
  const created = await (tx as any).inventoryItem.create({
    data: { tenantId, sku, warehouseId, locationId, qtyOnHand: 0 },
  });
  return created.id;
}


