import { prisma } from "@/lib/prisma";
import { auditEvent, auditEventInTx } from "@/lib/observability/audit";

export type GoodsReceiptInput = {
  tenantId: string;
  sku: string;
  qty: number; // in base units
  unitCostMinor: number; // minor units
  warehouseId?: string | null;
  locationId?: string | null;
  actorId: string;
};

export async function postGoodsReceipt({ tenantId, sku, qty, unitCostMinor, warehouseId, locationId, actorId }: GoodsReceiptInput) {
  return await prisma.$transaction(async (tx) => {
    // Create a receipt lot for FIFO/WAV
    try {
      await (tx as any).inventoryLot.create({
        data: { tenantId, sku, qty: qty as any, unitCost: unitCostMinor as any, warehouseId: warehouseId ?? undefined, locationId: locationId ?? undefined },
      });
    } catch {}

    // Atomic increment with optimistic locking retry
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await tx.inventoryItem.findFirst({ where: { tenantId, sku } });
      if (!current) {
        const created = await tx.inventoryItem.create({ data: { tenantId, sku, qtyOnHand: qty as any, warehouseId: warehouseId ?? undefined, locationId: locationId ?? undefined } });
        await auditEventInTx(tx as any, "inventory.grn.received", { tenantId, actorId, sku, qty, unitCostMinor, warehouseId, locationId });
        return created;
      }
      const prevUpdatedAt = current.updatedAt;
      const res = await tx.inventoryItem.updateMany({
        where: { id: current.id, updatedAt: prevUpdatedAt },
        data: { qtyOnHand: { increment: qty as any } },
      });
      if (res.count === 1) {
        const updated = await tx.inventoryItem.findUnique({ where: { id: current.id } });
        await auditEventInTx(tx as any, "inventory.grn.received", { tenantId, actorId, sku, qty, unitCostMinor, warehouseId, locationId });
        return updated as any;
      }
    }
    throw Object.assign(new Error("Concurrent update"), { code: 409 });
  });
}


