import { prisma } from "@/lib/prisma";
import { auditEvent, auditEventInTx } from "@/lib/observability/audit";
import { canTransitionInvoice, nextStatusForInvoiceAfterPayment, canTransitionBill, nextStatusForBillAfterPayment } from "@/lib/finance/apar-lifecycle";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { FinanceInvoiceCreated, FinanceInvoicePaid, FinancePaymentApplied } from "@/server/events/types";
import { incrementCounter, recordDuration } from "@/server/observability/metrics";
import { captureError } from "@/server/observability/sentry";

export type ApproveInvoiceInput = {
  tenantId: string;
  invoiceId: string;
  actorId: string;
  actorRole?: string; // Optional: if not provided, workflow check is skipped (backward compatibility)
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

export async function approveCustomerInvoice({ tenantId, invoiceId, actorId, actorRole }: ApproveInvoiceInput) {
  const start = Date.now();
  try {
    // Workflow check (if actorRole provided)
    if (actorRole) {
      const { checkWorkflowTransition, recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
      const workflowCheck = await checkWorkflowTransition({
        entityType: "finance.invoice",
        entityId: invoiceId,
        tenantId,
        actorId,
        actorRole,
        action: "approve",
      });

      if (!workflowCheck.allowed) {
        throw Object.assign(new Error(workflowCheck.reason || "Workflow transition denied"), { code: 403 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.customerInvoice.findUnique({ where: { id: invoiceId } });
      if (!inv) throw Object.assign(new Error("Invoice not found"), { code: 404 });
      ensureTenant(inv, tenantId);
      if (!canTransitionInvoice(inv.status as any, "approved")) {
        throw Object.assign(new Error("Invalid status"), { code: 409 });
      }
      const updated = await tx.customerInvoice.update({ where: { id: invoiceId }, data: { status: "approved" } });
      await auditEventInTx(tx, "finance.invoice.approved", { tenantId, actorId, invoiceId, approvedAt: new Date().toISOString() });
      return updated;
    });

    // Record workflow state change (if actorRole provided)
    if (actorRole) {
      const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
      await recordWorkflowStateChange({
        entityType: "finance.invoice",
        entityId: invoiceId,
        tenantId,
        actorId,
        fromState: previousState,
        toState: "approved",
        action: "approve",
      }).catch(() => {
        // Ignore errors - workflow recording is best-effort
      });
    }

    const duration = Date.now() - start;
    incrementCounter("finance_invoice_created", {
      module: "finance",
      operation: "approve_invoice",
      tenantId,
      status: "ok",
    });
    recordDuration("finance_invoice_duration_ms", duration, {
      module: "finance",
      operation: "approve_invoice",
      tenantId,
    });

  // Publish event (after transaction completes)
  try {
    const event: FinanceInvoiceCreated = {
      id: newEventId(),
      tenantId,
      type: "finance.invoice.created",
      occurredAt: nowIso(),
      source: "finance.ap",
      version: 1,
      payload: {
        invoiceId: updated.id,
        number: updated.number,
        totalMinor: Number(updated.total) * 100, // Convert to minor units
        currencyCode: updated.currency,
        issuedAt: updated.issuedAt.toISOString(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    // Log but don't throw - event publishing is best-effort
    console.warn(`[Finance] Failed to publish invoice.created event:`, error);
    captureError(error, { module: "finance", operation: "publish_invoice_created" });
  }

  return updated;
  } catch (error) {
    const duration = Date.now() - start;
    incrementCounter("finance_invoice_created", {
      module: "finance",
      operation: "approve_invoice",
      tenantId,
      status: "error",
    });
    recordDuration("finance_invoice_duration_ms", duration, {
      module: "finance",
      operation: "approve_invoice",
      tenantId,
    });
    captureError(error, { module: "finance", operation: "approve_invoice", tenantId, invoiceId });
    throw error;
  }
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
    // Phase 5A: Use centralized tax service to get VAT rate
    // For invoice payment, we use the invoice's total which already includes tax
    // Simplified: assume 20% VAT (can be enhanced to read from invoice tax breakdown)
    const vatRate = 0.2; // Default UK VAT - invoice total already includes tax
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

    const remaining = total - newPaid;
    const status = nextStatusForInvoiceAfterPayment(inv.status as any, remaining) as any;
    const updated = await tx.customerInvoice.update({ where: { id: invoiceId }, data: { status } });
    await auditEventInTx(tx, "finance.invoice.paid", { tenantId, actorId, invoiceId, entryId: entry.id, vatMinor, method, reference, settledMinor: amountMinor, balanceMinor: total - newPaid });
    return { updated, inv, amountMinor, newPaid };
  });

  // Publish events (after transaction completes)
  try {
    // Invoice paid event
    if (updated.newPaid >= Number(updated.inv.total)) {
      const paidEvent: FinanceInvoicePaid = {
        id: newEventId(),
        tenantId,
        type: "finance.invoice.paid",
        occurredAt: nowIso(),
        source: "finance.ap",
        version: 1,
        payload: {
          invoiceId: updated.inv.id,
          number: updated.inv.number,
          amountPaidMinor: updated.newPaid * 100,
          currencyCode: updated.inv.currency,
          paidAt: nowIso(),
        },
      };
      await publishWithOutbox(paidEvent);
    }

    // Payment applied event
    const paymentEvent: FinancePaymentApplied = {
      id: newEventId(),
      tenantId,
      type: "finance.payment.applied",
      occurredAt: nowIso(),
      source: "finance.ap",
      version: 1,
      payload: {
        paymentId: `payment-${updated.inv.id}-${Date.now()}`,
        invoiceId: updated.inv.id,
        amountMinor: updated.amountMinor * 100,
        currencyCode: updated.inv.currency,
        appliedAt: nowIso(),
      },
    };
    await publishWithOutbox(paymentEvent);
  } catch (error) {
    // Log but don't throw - event publishing is best-effort
    console.warn(`[Finance] Failed to publish payment events:`, error);
  }

  return updated.updated;
}

export type ApproveBillInput = { tenantId: string; billId: string; actorId: string };
export type PayBillInput = {
  tenantId: string;
  billId: string;
  amountMinor: number;
  method: string;
  reference?: string;
  actorId: string;
};

export async function approveSupplierBill({ tenantId, billId, actorId }: ApproveBillInput) {
  return await prisma.$transaction(async (tx) => {
    const bill = await tx.supplierBill.findUnique({ where: { id: billId } });
    if (!bill) throw Object.assign(new Error("Bill not found"), { code: 404 });
    ensureTenant(bill as any, tenantId);
    if (!canTransitionBill(bill.status as any, "approved")) throw Object.assign(new Error("Invalid status"), { code: 409 });
    const updated = await tx.supplierBill.update({ where: { id: billId }, data: { status: "approved" } });
    await auditEventInTx(tx, "finance.bill.approved", { tenantId, actorId, billId, approvedAt: new Date().toISOString() });
    return updated;
  });
}

export async function paySupplierBill({ tenantId, billId, amountMinor, method, reference, actorId }: PayBillInput) {
  return await prisma.$transaction(async (tx) => {
    const bill = await tx.supplierBill.findUnique({ where: { id: billId } });
    if (!bill) throw Object.assign(new Error("Bill not found"), { code: 404 });
    ensureTenant(bill as any, tenantId);
    if ((bill.status as any) !== "approved" && (bill.status as any) !== "part_paid") {
      throw Object.assign(new Error("Bill not payable"), { code: 400 });
    }
    if (reference) {
      const dup = await tx.supplierPayment.findFirst({ where: { tenantId, billId, reference } });
      if (dup) throw Object.assign(new Error("Duplicate reference"), { code: 409 });
    }
    const paidAgg = await tx.supplierPayment.aggregate({ where: { billId }, _sum: { amount: true } });
    const alreadyPaid = Number(paidAgg._sum.amount || 0);
    const total = Number(bill.total);
    const newPaid = alreadyPaid + Number(amountMinor);
    if (newPaid > total) throw Object.assign(new Error("Overpayment"), { code: 400 });

    await tx.supplierPayment.create({ data: { tenantId, billId, amount: amountMinor as any, method, reference } });
    // GL placeholder: AP settlement posting (using generic accounts). Real mapping requires full COA config.
    const [ap, exp] = await Promise.all([
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "AP" } as any }, update: {}, create: { tenantId, code: "AP", type: "liability", name: "Accounts Payable" } }),
      tx.account.upsert({ where: { tenantId_code: { tenantId, code: "EXP" } as any }, update: {}, create: { tenantId, code: "EXP", type: "expense", name: "Expenses" } }),
    ]);
    const grossMinor = Number(bill.total);
    await tx.journalEntry.create({
      data: {
        tenantId,
        docRef: `AP:${bill.number}`,
        memo: "AP settlement",
        lines: { create: [{ tenantId, accountId: exp.id, debit: grossMinor as any, credit: 0 as any }, { tenantId, accountId: ap.id, debit: 0 as any, credit: grossMinor as any }] },
      },
    });
    const remaining = total - newPaid;
    const status = nextStatusForBillAfterPayment(bill.status as any, remaining) as any;
    const updated = await tx.supplierBill.update({ where: { id: billId }, data: { status } });
    await auditEventInTx(tx, "finance.bill.paid", { tenantId, actorId, billId, settledMinor: amountMinor, balanceMinor: remaining, method, reference });
    return updated;
  });
}


