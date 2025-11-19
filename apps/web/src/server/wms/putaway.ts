/**
 * Phase 5A — WMS Putaway
 * Depth Pass: Putaway task creation and completion
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";

/**
 * Create putaway tasks after GRN
 * Phase 5A: Creates tasks for moving stock from staging to final locations
 */
export async function createPutawayTasks(
  scope: { tenantId: string; entityId?: string | null },
  grnId: string,
  tasks: Array<{
    sku: string;
    qty: number;
    fromLocationId?: string | null;
    toLocationId: string;
  }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const createdTasks = [];

  for (const task of tasks) {
    const putawayTask = await prisma.putawayTask.create({
      data: {
        tenantId: scope.tenantId,
        grnId,
        sku: task.sku,
        qty: task.qty as any,
        fromLocationId: task.fromLocationId || null,
        toLocationId: task.toLocationId,
        status: "pending",
      },
    });
    createdTasks.push(putawayTask);
  }

  // Audit log
  try {
    await auditEvent("wms.putaway.tasks.created", {
      tenantId: scope.tenantId,
      grnId,
      taskCount: createdTasks.length,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return createdTasks;
}

/**
 * Complete a putaway task
 * Phase 5A: Moves stock from staging to final location, creates StockMove, emits event
 */
export async function completePutawayTask(
  scope: { tenantId: string; entityId?: string | null },
  putawayTaskId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const task = await prisma.putawayTask.findFirst({
    where: { id: putawayTaskId, tenantId: scope.tenantId },
    include: {
      fromLocation: true,
      toLocation: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!task) {
    throw Object.assign(new Error("Putaway task not found"), { code: 404 });
  }

  if (task.status === "completed") {
    throw Object.assign(new Error("Task already completed"), { code: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    // Update task status
    const updatedTask = await tx.putawayTask.update({
      where: { id: putawayTaskId },
      data: {
        status: "completed",
        completedAt: new Date(),
        completedBy: actorId,
      },
    });

    // Create StockMove entry (Phase 5A)
    await (tx as any).stockMove.create({
      data: {
        tenantId: scope.tenantId,
        sku: task.sku,
        warehouseId: task.toLocation.warehouseId || null,
        fromLocationId: task.fromLocationId || null,
        toLocationId: task.toLocationId,
        type: "putaway",
        qty: task.qty,
        unitCost: 0 as any, // Cost already recorded in GRN StockMove
        totalCost: 0 as any,
        sourceType: "putaway_task",
        sourceId: putawayTaskId,
        movedAt: new Date(),
        movedBy: actorId,
        reference: `Putaway: ${task.sku}`,
      },
    });

    // Update inventory on-hand at target location
    // Note: This is simplified - in a full implementation, we'd track per-location quantities
    const inventoryItem = await tx.inventoryItem.findFirst({
      where: { tenantId: scope.tenantId, sku: task.sku },
    });

    if (inventoryItem) {
      // Update location if needed
      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { locationId: task.toLocationId },
      });
    }

    // Audit log
    try {
      await auditEvent("wms.putaway.completed", {
        tenantId: scope.tenantId,
        putawayTaskId,
        sku: task.sku,
        qty: Number(task.qty),
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain event (Phase 5A)
    try {
      const type = await import("@/server/events/types");
      await publishWithOutbox<type.WmsPutawayCompleted>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "wms.putaway.completed",
        occurredAt: nowIso(),
        source: "wms.putaway",
        version: 1,
        payload: {
          putawayTaskId,
          sku: task.sku,
          qty: Number(task.qty),
          fromLocationId: task.fromLocationId || "",
          toLocationId: task.toLocationId,
          completedAt: updatedTask.completedAt!.toISOString(),
          actorId,
        },
      });
    } catch (error) {
      console.error("[WMS] Failed to emit putaway.completed event:", error);
    }

    return updatedTask;
  });
}

