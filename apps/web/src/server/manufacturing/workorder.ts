import { prisma } from "@/lib/prisma";
import { auditEventInTx } from "@/lib/observability/audit";

export async function consumeBomForWorkOrder(tenantId: string, workOrderId: string, actorId: string) {
  return await prisma.$transaction(async (tx) => {
    const wo = await tx.workOrder.findUnique({ where: { id: workOrderId } });
    if (!wo) throw Object.assign(new Error("Work order not found"), { code: 404 });
    if (wo.tenantId !== tenantId) throw Object.assign(new Error("Not found"), { code: 404 });
    if (wo.status !== "released" && wo.status !== "planned") {
      // Simplified: treat non-released as invalid for issue
      throw Object.assign(new Error("Invalid status"), { code: 409 });
    }

    const bom = await tx.bomItem.findMany({ where: { tenantId, parentItemCode: wo.itemCode } });
    for (const line of bom) {
      const deductQty = Number(line.quantity) * Number(wo.quantity);
      const item = await tx.inventoryItem.findFirst({ where: { tenantId, sku: line.componentItemCode } });
      const onHand = Number(item?.qtyOnHand || 0);
      if (onHand < deductQty) {
        throw Object.assign(new Error("Insufficient stock"), { code: 409 });
      }
      await tx.inventoryItem.update({ where: { id: item!.id }, data: { qtyOnHand: { decrement: deductQty as any } } });
    }

    const updated = await tx.workOrder.update({ where: { id: workOrderId }, data: { status: "completed" } });
    await auditEventInTx(tx as any, "mfg.workorder.consumed_bom", { tenantId, actorId, workOrderId, itemCode: wo.itemCode, qty: wo.quantity });
    return updated;
  });
}


