import { prisma } from "@/lib/prisma";
import { auditEvent, auditEventInTx } from "@/lib/observability/audit";

export type ApproveInvoiceInput = {
  tenantId: string;
  invoiceId: string;
  actorId: string;
};

export type PayInvoiceInput = {
  tenantId: string;
  invoiceId: string;
  amountMinor: number; // minor units
  method: string;
  reference?: string;
  actorId: string;
};

function ensureTenant<T extends { tenantId: string }>(rec: T, tenantId: string) {
  if (!rec || rec.tenantId !== tenantId) throw Object.assign(new Error("Not found"), { code: 404 });
}

export async function approveCustomerInvoice({ tenantId, invoiceId, actorId }: ApproveInvoiceInput) {
  return await prisma.$transaction(async (tx) => {
    const inv = await tx.customerInvoice.findUnique({ where: { id: invoiceId } });
    if (!inv) throw Object.assign(new Error("Invoice not found"), { code: 404 });
    ensureTenant(inv, tenantId);
    if (inv.status !== "draft") {
      throw Object.assign(new Error("Invalid status"), { code: 409 });
    }
    const updated = await tx.customerInvoice.update({ where: { id: invoiceId }, data: { status: "approved" } });
    await auditEventInTx(tx, "finance.invoice.approved", { tenantId, actorId, invoiceId, approvedAt: new Date().toISOString() });
    return updated;
  });
}

/**
 * Payment rules:
 * - Invoice must be approved
 * - Reference must be unique per-invoice
 * - Mark paid only when balance is zero
 * - VAT posting: compute net/vat from invoice total using 2dp rounding as placeholder (line-level VAT not available in schema)
 */
export async function payCustomerInvoice({ tenantId, invoiceId, amountMinor, method, reference, actorId }: PayInvoiceInput) {
  return await prisma.$transaction(async (tx) => {
    const inv = await tx.customerInvoice.findUnique({ where: { id: invoiceId } });
    if (!inv) throw Object.assign(new Error("Invoice not found"), { code: 404 });
    ensureTenant(inv, tenantId);
    if (inv.status !== "approved" && inv.status !== "part_paid") {
      throw Object.assign(new Error("Invoice not payable"), { code: 400 });
    }

    if (reference) {
      const dup = await tx.customerPayment.findFirst({ where: { tenantId, invoiceId, reference } });
      if (dup) throw Object.assign(new Error("Duplicate reference"), { code: 409 });
    }

    const paidAgg = await tx.customerPayment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
    const alreadyPaid = Number(paidAgg._sum.amount || 0);
    const total = Number(inv.total);
    const newPaid = alreadyPaid + Number(amountMinor);
    if (newPaid > total) throw Object.assign(new Error("Overpayment"), { code: 400 });

    await tx.customerPayment.create({ data: { tenantId, invoiceId, amount: amountMinor as any, method, reference } });

    const grossMinor = Number(inv.total);
    const vatRate = 0.2; // TODO(Task 2): replace with per-line VAT rate computation
    const netMinor = Math.round(grossMinor / (1 + vatRate));
    const vatMinor = grossMinor - netMinor;

    const [ar, rev, vat] = await Promise.all([
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "AR" } as any }, update: {}, create: { tenantId, code: "AR", type: "asset", name: "Accounts Receivable" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "REV" } as any }, update: {}, create: { tenantId, code: "REV", type: "revenue", name: "Revenue" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "VAT" } as any }, update: {}, create: { tenantId, code: "VAT", type: "liability", name: "VAT Output" } }),
    ]);

    const entry = await tx.journalEntry.create({
      data: {
        tenantId,
        docRef: `AR:${inv.number}`,
        memo: "AR settlement",
        lines: {
          create: [
            { tenantId, accountId: ar.id, debit: 0 as any, credit: grossMinor as any },
            { tenantId, accountId: rev.id, debit: netMinor as any, credit: 0 as any },
            { tenantId, accountId: vat.id, debit: vatMinor as any, credit: 0 as any },
          ],
        },
      },
      include: { lines: true },
    });

    const status = newPaid === total ? "paid" : "part_paid";
    const updated = await tx.customerInvoice.update({ where: { id: invoiceId }, data: { status } });
    await auditEventInTx(tx, "finance.invoice.paid", { tenantId, actorId, invoiceId, entryId: entry.id, vatMinor, method, reference, settledMinor: amountMinor, balanceMinor: total - newPaid });
    return updated;
  });
}


