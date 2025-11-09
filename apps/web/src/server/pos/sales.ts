import { prisma } from "@/lib/prisma";
import { auditEventInTx } from "@/lib/observability/audit";
import { computeCogsForSkus } from "@/server/inventory/valuation";

/** Finalise a POS sale: mark as paid, create journal entry, link by docRef. */
export async function finalisePosSale(tenantId: string, saleId: string, actorId: string) {
  return await prisma.$transaction(async (tx) => {
    const sale = await tx.posSale.findUnique({ where: { id: saleId }, include: { payments: true, lines: true } as any });
    if (!sale || sale.tenantId !== tenantId) throw Object.assign(new Error("Sale not found"), { code: 404 });
    if (sale.status === "paid") return sale; // idempotent

    const grossMinor = Number(sale.total);
    const [cash, revenue, cogsAcc, invAcc] = await Promise.all([
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "CASH" } as any }, update: {}, create: { tenantId, code: "CASH", type: "asset", name: "Cash" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "REV" } as any }, update: {}, create: { tenantId, code: "REV", type: "revenue", name: "Revenue" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "COGS" } as any }, update: {}, create: { tenantId, code: "COGS", type: "expense", name: "Cost of Goods Sold" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "INV" } as any }, update: {}, create: { tenantId, code: "INV", type: "asset", name: "Inventory" } }),
    ]);

    // Compute simple WAVG COGS per SKU (best-effort)
    const saleItems = (sale as any).lines?.map((l: any) => ({ sku: String(l.sku), qtyMinor: Number(l.qty || 0) })) || [];
    const cogs = await computeCogsForSkus(tenantId, saleItems);
    const totalCogs = cogs.reduce((s, r) => s + Number(r.totalCostMinor || 0), 0);

    const entry = await tx.journalEntry.create({
      data: {
        tenantId,
        docRef: `POS:${sale.saleNumber}`,
        memo: "POS receipt",
        lines: {
          create: [
            { tenantId, accountId: cash.id, debit: grossMinor as any, credit: 0 as any },
            { tenantId, accountId: revenue.id, debit: 0 as any, credit: grossMinor as any },
            // COGS posting if cost known
            ...(totalCogs > 0
              ? [
                  { tenantId, accountId: cogsAcc.id, debit: totalCogs as any, credit: 0 as any },
                  { tenantId, accountId: invAcc.id, debit: 0 as any, credit: totalCogs as any },
                ]
              : []),
          ],
        },
      },
    });

    const updated = await tx.posSale.update({ where: { id: saleId }, data: { status: "paid" } });
    await auditEventInTx(tx as any, "pos.sale.finalised", { tenantId, actorId, saleId, entryId: entry.id, total: grossMinor });
    return updated;
  });
}


