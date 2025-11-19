/**
 * Phase 5A — WMS Cycle Count
 * Depth Pass: Cycle count planning, execution, and variance posting
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";

/**
 * Create cycle count plan
 * Phase 5A: Creates a plan for counting specific locations/products
 */
export async function createCycleCountPlan(
  scope: { tenantId: string; entityId?: string | null },
  warehouseId: string,
  name: string,
  frequency: string,
  startDate: Date,
  endDate: Date,
  lines: Array<{ sku: string; locationId?: string | null }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  return await prisma.$transaction(async (tx) => {
    // Create plan header
    const plan = await (tx as any).cycleCountPlan.create({
      data: {
        tenantId: scope.tenantId,
        warehouseId,
        name,
        frequency,
        status: "planned",
        startDate,
        endDate,
        createdBy: actorId,
      },
    });

    // Create plan lines with expected quantities
    for (const line of lines) {
      // Get current on-hand quantity
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: {
          tenantId: scope.tenantId,
          sku: line.sku,
          locationId: line.locationId || null,
        },
      });

      const expectedQty = inventoryItem ? Number(inventoryItem.qtyOnHand) : 0;

      await (tx as any).cycleCountLine.create({
        data: {
          tenantId: scope.tenantId,
          planId: plan.id,
          sku: line.sku,
          locationId: line.locationId || null,
          expectedQty: expectedQty as any,
          countedQty: null,
          varianceQty: null,
          status: "pending",
        },
      });
    }

    return plan;
  });
}

/**
 * Record cycle count result
 * Phase 5A: Records counted quantity and calculates variance
 */
export async function recordCycleCountResult(
  scope: { tenantId: string; entityId?: string | null },
  cycleCountLineId: string,
  countedQty: number,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const line = await (prisma as any).cycleCountLine.findFirst({
    where: { id: cycleCountLineId, tenantId: scope.tenantId },
    include: {
      plan: true,
    },
  });

  if (!line) {
    throw Object.assign(new Error("Cycle count line not found"), { code: 404 });
  }

  const expectedQty = Number(line.expectedQty);
  const varianceQty = countedQty - expectedQty;

  const updated = await (prisma as any).cycleCountLine.update({
    where: { id: cycleCountLineId },
    data: {
      countedQty: countedQty as any,
      varianceQty: varianceQty as any,
      status: "counted",
      countedAt: new Date(),
      countedBy: actorId,
    },
  });

  return updated;
}

/**
 * Approve and post cycle count variance
 * Phase 5A: Creates StockMove adjustment and posts to Finance
 */
export async function approveCycleCountVariance(
  scope: { tenantId: string; entityId?: string | null },
  cycleCountLineId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const line = await (prisma as any).cycleCountLine.findFirst({
    where: { id: cycleCountLineId, tenantId: scope.tenantId },
    include: {
      plan: true,
      location: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!line) {
    throw Object.assign(new Error("Cycle count line not found"), { code: 404 });
  }

  if (line.status !== "counted") {
    throw Object.assign(new Error("Line must be counted before approval"), { code: 400 });
  }

  const varianceQty = Number(line.varianceQty);
  if (varianceQty === 0) {
    // No variance, just mark as approved
    return await (prisma as any).cycleCountLine.update({
      where: { id: cycleCountLineId },
      data: {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: actorId,
      },
    });
  }

  return await prisma.$transaction(async (tx) => {
    // Update inventory on-hand
    const inventoryItem = await tx.inventoryItem.findFirst({
      where: { tenantId: scope.tenantId, sku: line.sku },
    });

    if (inventoryItem) {
      await tx.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { qtyOnHand: { increment: varianceQty as any } },
      });
    } else if (varianceQty > 0) {
      // Positive variance - create inventory item
      await tx.inventoryItem.create({
        data: {
          tenantId: scope.tenantId,
          sku: line.sku,
          qtyOnHand: varianceQty as any,
          locationId: line.locationId || null,
        },
      });
    }

    // Create StockMove adjustment entry
    await (tx as any).stockMove.create({
      data: {
        tenantId: scope.tenantId,
        sku: line.sku,
        warehouseId: line.location?.warehouseId || null,
        fromLocationId: null,
        toLocationId: line.locationId || null,
        type: "cycle_count_adjustment",
        qty: Math.abs(varianceQty) as any,
        unitCost: 0 as any, // Cost adjustment would come from valuation
        totalCost: 0 as any,
        sourceType: "cycle_count",
        sourceId: cycleCountLineId,
        movedAt: new Date(),
        movedBy: actorId,
        reference: `Cycle Count: ${line.plan.name}`,
      },
    });

    // Update line status
    const updated = await (tx as any).cycleCountLine.update({
      where: { id: cycleCountLineId },
      data: {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: actorId,
      },
    });

    // Audit log
    try {
      await auditEvent("wms.cyclecount.approved", {
        tenantId: scope.tenantId,
        cycleCountLineId,
        varianceQty,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain event (Phase 5A)
    try {
      const type = await import("@/server/events/types");
      await publishWithOutbox<type.WmsCycleCountVariance>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "wms.cyclecount.variance",
        occurredAt: nowIso(),
        source: "wms.cyclecount",
        version: 1,
        payload: {
          cycleCountLineId,
          sku: line.sku,
          locationId: line.locationId || "",
          expectedQty: Number(line.expectedQty),
          countedQty: Number(line.countedQty),
          varianceQty,
          approvedAt: updated.approvedAt!.toISOString(),
          actorId,
        },
      });
    } catch (error) {
      console.error("[WMS] Failed to emit cyclecount.variance event:", error);
    }

    return updated;
  });
}

