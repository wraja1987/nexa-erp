/**
 * Phase 5A — WMS Pick and Ship
 * Depth Pass: Pick task completion and shipment confirmation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";

/**
 * Complete a pick task
 * Phase 5A: Moves stock from storage to picked state, creates StockMove, emits event
 */
export async function completePickTask(
  scope: { tenantId: string; entityId?: string | null },
  pickTaskId: string,
  qtyPicked: number,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const task = await (prisma as any).pickTask.findFirst({
    where: { id: pickTaskId, tenantId: scope.tenantId },
    include: {
      wave: true,
      fromLoc: true,
      toLoc: true,
    },
  });

  if (!task) {
    throw Object.assign(new Error("Pick task not found"), { code: 404 });
  }

  if (task.status === "completed") {
    throw Object.assign(new Error("Task already completed"), { code: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    // Update task status
    const updatedTask = await (tx as any).pickTask.update({
      where: { id: pickTaskId },
      data: {
        status: "completed",
        quantityPicked: qtyPicked as any,
        completedAt: new Date(),
      },
    });

    // Create StockMove entry (Phase 5A)
    await (tx as any).stockMove.create({
      data: {
        tenantId: scope.tenantId,
        sku: task.sku,
        warehouseId: task.fromLoc?.warehouseId || null,
        fromLocationId: task.fromLocId || null,
        toLocationId: task.toLocId || null, // Picked location
        type: "pick",
        qty: qtyPicked as any,
        unitCost: 0 as any, // Cost already in inventory
        totalCost: 0 as any,
        sourceType: "pick_task",
        sourceId: pickTaskId,
        movedAt: new Date(),
        movedBy: actorId,
        reference: `Pick: ${task.sku}`,
      },
    });

    // Reduce inventory on-hand
    const inventoryItem = await tx.inventoryItem.findFirst({
      where: { tenantId: scope.tenantId, sku: task.sku },
    });

    if (inventoryItem) {
      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { qtyOnHand: { decrement: qtyPicked as any } },
      });
    }

    // Audit log
    try {
      await auditEvent("wms.pick.completed", {
        tenantId: scope.tenantId,
        pickTaskId,
        sku: task.sku,
        qty: qtyPicked,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain event (Phase 5A)
    try {
      const type = await import("@/server/events/types");
      await publishWithOutbox<type.WmsPickCompleted>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "wms.pick.completed",
        occurredAt: nowIso(),
        source: "wms.pick",
        version: 1,
        payload: {
          pickTaskId,
          sku: task.sku,
          qty: qtyPicked,
          fromLocationId: task.fromLocId || "",
          orderId: task.orderId || "",
          orderType: task.orderType || "sales_order",
          completedAt: updatedTask.completedAt!.toISOString(),
          actorId,
        },
      });
    } catch (error) {
      console.error("[WMS] Failed to emit pick.completed event:", error);
    }

    return updatedTask;
  });
}

/**
 * Confirm shipment
 * Phase 5A: Creates shipment record, finalizes outbound flow, emits event
 */
export async function confirmShipment(
  scope: { tenantId: string; entityId?: string | null },
  shipmentNumber: string,
  orderId: string,
  orderType: string,
  warehouseId: string,
  lines: Array<{ sku: string; qty: number }>,
  carrier?: string,
  tracking?: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  return await prisma.$transaction(async (tx) => {
    // Create shipment header
    const shipment = await (tx as any).shipment.create({
      data: {
        tenantId: scope.tenantId,
        number: shipmentNumber,
        orderId,
        orderType,
        warehouseId,
        carrier: carrier || null,
        tracking: tracking || null,
        status: "shipped",
        shippedAt: new Date(),
        createdBy: actorId,
      },
    });

    // Create shipment lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      await (tx as any).shipmentLine.create({
        data: {
          tenantId: scope.tenantId,
          shipmentId: shipment.id,
          lineNo: i + 1,
          sku: line.sku,
          qty: line.qty as any,
          pickedQty: line.qty as any,
          packedQty: line.qty as any,
          shippedQty: line.qty as any,
        },
      });

      // Create StockMove entry for shipment
      await (tx as any).stockMove.create({
        data: {
          tenantId: scope.tenantId,
          sku: line.sku,
          warehouseId,
          fromLocationId: null, // From picked location
          toLocationId: null, // Shipped out
          type: "shipment",
          qty: line.qty as any,
          unitCost: 0 as any,
          totalCost: 0 as any,
          sourceType: "shipment",
          sourceId: shipment.id,
          movedAt: new Date(),
          movedBy: actorId,
          reference: `Shipment: ${shipmentNumber}`,
        },
      });
    }

    // Audit log
    try {
      await auditEvent("wms.shipment.confirmed", {
        tenantId: scope.tenantId,
        shipmentId: shipment.id,
        shipmentNumber,
        orderId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain event (Phase 5A)
    try {
      const type = await import("@/server/events/types");
      await publishWithOutbox<type.WmsShipmentConfirmed>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "wms.shipment.confirmed",
        occurredAt: nowIso(),
        source: "wms.shipment",
        version: 1,
        payload: {
          shipmentId: shipment.id,
          shipmentNumber,
          orderId,
          orderType,
          warehouseId,
          shippedAt: shipment.shippedAt.toISOString(),
          actorId,
        },
      });
    } catch (error) {
      console.error("[WMS] Failed to emit shipment.confirmed event:", error);
    }

    return shipment;
  });
}

