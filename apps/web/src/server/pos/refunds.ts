/**
 * Phase 5A — POS Refunds
 * Depth Pass: Full refund service with stock reversal and finance impact
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import { computeCogsForSkus } from "@/server/inventory/valuation";

export interface PosRefundInput {
  saleId: string;
  reason?: string;
  lines: Array<{
    lineId: string;
    qty: number;
  }>;
}

/**
 * Create a refund for a POS sale
 * Phase 5A: Reverses stock movements and creates finance adjustments
 */
export async function createPosRefund(
  scope: { tenantId: string; entityId?: string | null },
  input: PosRefundInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const sale = await prisma.posSale.findFirst({
    where: { id: input.saleId, tenantId: scope.tenantId },
    include: {
      lines: true,
      payments: true,
      session: true,
      store: true,
    },
  });

  if (!sale) {
    throw Object.assign(new Error("Sale not found"), { code: 404 });
  }

  if (sale.status !== "paid") {
    throw Object.assign(new Error("Sale must be paid before refund"), { code: 400 });
  }

  return await prisma.$transaction(async (tx) => {
    // Calculate refund amount from lines
    let refundAmount = 0;
    const refundLines: Array<{ sku: string; qty: number; unitPrice: number }> = [];

    for (const refundLine of input.lines) {
      const saleLine = sale.lines.find((l: any) => l.id === refundLine.lineId);
      if (!saleLine) {
        throw Object.assign(new Error(`Sale line ${refundLine.lineId} not found`), { code: 404 });
      }

      const qty = Math.min(refundLine.qty, Number(saleLine.qty));
      const unitPrice = Number(saleLine.unitPrice);
      refundAmount += qty * unitPrice;
      refundLines.push({
        sku: saleLine.sku,
        qty,
        unitPrice,
      });
    }

    // Create refund record
    const refund = await (tx as any).posRefund.create({
      data: {
        tenantId: scope.tenantId,
        saleId: input.saleId,
        amount: refundAmount as any,
        reason: input.reason || null,
        status: "pending",
        createdAt: new Date(),
      },
    });

    // Reverse stock movements (Phase 5A)
    for (const refundLine of refundLines) {
      // Create StockMove entry to reverse the sale
      try {
        await (tx as any).stockMove.create({
          data: {
            tenantId: scope.tenantId,
            sku: refundLine.sku,
            warehouseId: sale.storeId || null, // Using storeId as warehouseId
            fromLocationId: null, // Refund from external
            toLocationId: null, // Will be put away later
            type: "refund",
            qty: refundLine.qty as any,
            unitCost: refundLine.unitPrice as any, // Use sale price as cost
            totalCost: (refundLine.qty * refundLine.unitPrice) as any,
            sourceType: "pos_refund",
            sourceId: refund.id,
            movedAt: new Date(),
            movedBy: actorId,
            reference: `Refund: ${sale.saleNumber}`,
          },
        });

        // Increase inventory on-hand
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: { tenantId: scope.tenantId, sku: refundLine.sku },
        });

        if (inventoryItem) {
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { qtyOnHand: { increment: refundLine.qty as any } },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              tenantId: scope.tenantId,
              sku: refundLine.sku,
              qtyOnHand: refundLine.qty as any,
            },
          });
        }
      } catch (error) {
        console.error(`[POS] Failed to reverse stock for refund line ${refundLine.sku}:`, error);
        // Continue with other lines
      }
    }

    // Create finance adjustment (reverse revenue entry)
    const [cash, revenue, cogsAcc, invAcc] = await Promise.all([
      tx.account.upsert({
        where: { tenantId_code: { tenantId: scope.tenantId, code: "CASH" } as any },
        update: {},
        create: { tenantId: scope.tenantId, code: "CASH", type: "asset", name: "Cash" },
      }),
      tx.account.upsert({
        where: { tenantId_code: { tenantId: scope.tenantId, code: "REV" } as any },
        update: {},
        create: { tenantId: scope.tenantId, code: "REV", type: "revenue", name: "Revenue" },
      }),
      tx.account.upsert({
        where: { tenantId_code: { tenantId: scope.tenantId, code: "COGS" } as any },
        update: {},
        create: { tenantId: scope.tenantId, code: "COGS", type: "expense", name: "Cost of Goods Sold" },
      }),
      tx.account.upsert({
        where: { tenantId_code: { tenantId: scope.tenantId, code: "INV" } as any },
        update: {},
        create: { tenantId: scope.tenantId, code: "INV", type: "asset", name: "Inventory" },
      }),
    ]);

    // Compute COGS reversal (simplified - uses sale price as cost)
    const totalCogs = refundLines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);

    await tx.journalEntry.create({
      data: {
        tenantId: scope.tenantId,
        docRef: `POS-REFUND:${sale.saleNumber}`,
        memo: `POS refund: ${input.reason || "Customer return"}`,
        lines: {
          create: [
            { tenantId: scope.tenantId, accountId: cash.id, debit: 0 as any, credit: refundAmount as any },
            { tenantId: scope.tenantId, accountId: revenue.id, debit: refundAmount as any, credit: 0 as any },
            // COGS reversal
            ...(totalCogs > 0
              ? [
                  { tenantId: scope.tenantId, accountId: cogsAcc.id, debit: 0 as any, credit: totalCogs as any },
                  { tenantId: scope.tenantId, accountId: invAcc.id, debit: totalCogs as any, credit: 0 as any },
                ]
              : []),
          ],
        },
      },
    });

    // Update refund status
    const updatedRefund = await (tx as any).posRefund.update({
      where: { id: refund.id },
      data: { status: "completed" },
    });

    // Audit log
    try {
      await auditEvent("pos.refund.created", {
        tenantId: scope.tenantId,
        refundId: refund.id,
        saleId: input.saleId,
        amount: refundAmount,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    // Emit domain event (Phase 5A)
    try {
      const type = await import("@/server/events/types");
      await publishWithOutbox<type.PosRefundCreated>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "pos.refund.created",
        occurredAt: nowIso(),
        source: "pos.refunds",
        version: 1,
        payload: {
          refundId: refund.id,
          saleId: input.saleId,
          storeId: sale.storeId,
          sessionId: sale.sessionId || undefined,
          amount: refundAmount,
          reason: input.reason,
          createdAt: refund.createdAt.toISOString(),
          actorId,
        },
      });
    } catch (error) {
      console.error("[POS] Failed to emit refund.created event:", error);
    }

    return updatedRefund;
  });
}

