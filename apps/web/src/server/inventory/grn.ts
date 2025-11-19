import { prisma } from "@/lib/prisma";
import { auditEvent, auditEventInTx } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";

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
        
        // Create StockMove entry (Phase 4E - Depth Pass)
        try {
          await (tx as any).stockMove.create({
            data: {
              tenantId,
              sku,
              warehouseId: warehouseId || null,
              fromLocationId: null, // GRN from external
              toLocationId: locationId || null,
              type: "grn",
              qty: qty as any,
              unitCost: unitCostMinor as any,
              totalCost: (qty * unitCostMinor) as any,
              sourceType: "grn",
              sourceId: null, // Could link to PurchaseOrder if available
              movedAt: new Date(),
              movedBy: actorId,
              reference: `GRN: ${sku}`,
            },
          });
        } catch (error) {
          // Log but don't fail - StockMove is best-effort
          console.error("[WMS] Failed to create StockMove for GRN:", error);
        }
        
        // Emit domain event after transaction (Phase 4E)
        try {
          const type = await import("@/server/events/types");
          await publishWithOutbox<type.WmsGrnReceived>({
            id: newEventId(),
            tenantId,
            type: "wms.grn.received",
            occurredAt: nowIso(),
            source: "inventory.grn",
            version: 1,
            payload: {
              sku,
              qty,
              unitCost: unitCostMinor,
              warehouseId: warehouseId || undefined,
              locationId: locationId || undefined,
              receivedAt: new Date().toISOString(),
              actorId,
            },
          });
        } catch (error) {
          console.error("[WMS] Failed to emit grn.received event:", error);
        }
        
        return updated as any;
      }
    }
    throw Object.assign(new Error("Concurrent update"), { code: 409 });
  });
}


