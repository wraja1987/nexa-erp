/**
 * Phase 5A — Manufacturing Material Issue
 * Depth Pass: Work order material issue/return with stock movements
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import { computeCogsForSkus } from "@/server/inventory/valuation";

/**
 * Issue materials to work order
 * Phase 5A: Creates material issue record, reduces stock, creates StockMove, emits event
 */
export async function issueMaterialsToWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  workOrderId: string,
  issues: Array<{
    sku: string;
    qty: number;
    locationId?: string | null;
    lotId?: string | null;
  }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const workOrder = await prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId: scope.tenantId },
  });

  if (!workOrder) {
    throw Object.assign(new Error("Work order not found"), { code: 404 });
  }

  if (workOrder.status !== "released" && workOrder.status !== "in_progress") {
    throw Object.assign(new Error("Work order must be released or in progress"), { code: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    const materialIssues = [];

    // Compute COGS for all SKUs
    const cogsMap = await computeCogsForSkus(
      scope.tenantId,
      issues.map((issue) => ({ sku: issue.sku, qtyMinor: issue.qty }))
    );

    for (const issue of issues) {
      // Get unit cost from COGS calculation
      const cogs = cogsMap.find((c) => c.sku === issue.sku);
      const unitCost = cogs ? Number(cogs.avgCostMinor || 0) : 0;
      const totalCost = issue.qty * unitCost;

      // Create material issue record
      const materialIssue = await (tx as any).workOrderMaterialIssue.create({
        data: {
          tenantId: scope.tenantId,
          workOrderId,
          sku: issue.sku,
          qty: issue.qty as any,
          unitCost: unitCost as any,
          totalCost: totalCost as any,
          lotId: issue.lotId || null,
          type: "issue",
          issuedAt: new Date(),
          issuedBy: actorId,
        },
      });

      materialIssues.push(materialIssue);

      // Create StockMove entry
      await (tx as any).stockMove.create({
        data: {
          tenantId: scope.tenantId,
          sku: issue.sku,
          warehouseId: null, // Could be derived from location
          fromLocationId: issue.locationId || null,
          toLocationId: null, // To WIP
          type: "work_order_issue",
          qty: issue.qty as any,
          unitCost: unitCost as any,
          totalCost: totalCost as any,
          sourceType: "work_order",
          sourceId: workOrderId,
          lotId: issue.lotId || null,
          movedAt: new Date(),
          movedBy: actorId,
          reference: `WO ${workOrder.number}: ${issue.sku}`,
        },
      });

      // Reduce inventory on-hand
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: { tenantId: scope.tenantId, sku: issue.sku },
      });

      if (inventoryItem) {
        const currentQty = Number(inventoryItem.qtyOnHand);
        if (currentQty < issue.qty) {
          throw Object.assign(
            new Error(`Insufficient stock for ${issue.sku}: have ${currentQty}, need ${issue.qty}`),
            { code: 400 }
          );
        }

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { qtyOnHand: { decrement: issue.qty as any } },
        });
      } else {
        throw Object.assign(new Error(`Inventory item ${issue.sku} not found`), { code: 404 });
      }
    }

    // Audit log
    try {
      await auditEvent("manufacturing.material.issued", {
        tenantId: scope.tenantId,
        workOrderId,
        issueCount: materialIssues.length,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain events (Phase 5A)
    for (const materialIssue of materialIssues) {
      try {
        const type = await import("@/server/events/types");
        await publishWithOutbox<type.ManufacturingWorkorderMaterialIssued>({
          id: newEventId(),
          tenantId: scope.tenantId,
          type: "manufacturing.workorder.material.issued",
          occurredAt: nowIso(),
          source: "manufacturing.material-issue",
          version: 1,
          payload: {
            workOrderId,
            materialIssueId: materialIssue.id,
            sku: materialIssue.sku,
            qty: Number(materialIssue.qty),
            unitCost: Number(materialIssue.unitCost),
            issuedAt: materialIssue.issuedAt.toISOString(),
            actorId,
          },
        });
      } catch (error) {
        console.error("[Manufacturing] Failed to emit material.issued event:", error);
      }
    }

    return materialIssues;
  });
}

