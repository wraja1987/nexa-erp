/**
 * Phase 10 — Audit Pack Generator
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { getTrialBalance } from "@/server/finance/gl";
import { buildVatSummary } from "./vat";
import { prisma } from "@/lib/prisma";

export interface ArAgingBucket {
  bucket: string; // "current", "30", "60", "90", "120+"
  amount: number;
  count: number;
}

export interface ApAgingBucket {
  bucket: string;
  amount: number;
  count: number;
}

export interface AuditPack {
  period?: { start?: string; end?: string };
  sections: {
    trialBalance: { supported: boolean; data?: any; message?: string };
    arAging: { supported: boolean; data?: ArAgingBucket[]; message?: string };
    apAging: { supported: boolean; data?: ApAgingBucket[]; message?: string };
    vat: { supported: boolean; data?: any; message?: string };
    keyJournals: { supported: boolean; data?: any[]; message?: string };
  };
}

export async function buildAuditPack(
  scope: { tenantId: string; entityId?: string | null },
  period?: { start?: string; end?: string }
): Promise<AuditPack> {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const sections: AuditPack["sections"] = {
    trialBalance: { supported: false },
    arAging: { supported: false },
    apAging: { supported: false },
    vat: { supported: false },
    keyJournals: { supported: false },
  };

  const startDate = period?.start ? new Date(period.start) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = period?.end ? new Date(period.end) : new Date();

  // Trial Balance
  try {
    const tb = await getTrialBalance(scope.tenantId);
    sections.trialBalance = { supported: true, data: tb };
  } catch (e: any) {
    sections.trialBalance = { supported: false, message: String(e?.message || "error building trial balance") };
  }

  // AR Aging
  try {
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        tenantId: scope.tenantId,
        status: { not: "cancelled" },
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    const payments = await prisma.customerPayment.findMany({
      where: { tenantId: scope.tenantId },
    });

    // Group payments by invoice
    const paymentsByInvoice = new Map<string, number>();
    for (const payment of payments) {
      const existing = paymentsByInvoice.get(payment.invoiceId) || 0;
      paymentsByInvoice.set(payment.invoiceId, existing + Number(payment.amount));
    }

    // Calculate aging buckets
    const now = new Date();
    const buckets: ArAgingBucket[] = [
      { bucket: "current", amount: 0, count: 0 },
      { bucket: "30", amount: 0, count: 0 },
      { bucket: "60", amount: 0, count: 0 },
      { bucket: "90", amount: 0, count: 0 },
      { bucket: "120+", amount: 0, count: 0 },
    ];

    for (const invoice of invoices) {
      const paid = paymentsByInvoice.get(invoice.id) || 0;
      const outstanding = Number(invoice.total) - paid;

      if (outstanding <= 0) continue;

      const daysPastDue = Math.floor((now.getTime() - invoice.dueAt.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex = 0;
      if (daysPastDue <= 0) bucketIndex = 0;
      else if (daysPastDue <= 30) bucketIndex = 1;
      else if (daysPastDue <= 60) bucketIndex = 2;
      else if (daysPastDue <= 90) bucketIndex = 3;
      else bucketIndex = 4;

      buckets[bucketIndex].amount += outstanding;
      buckets[bucketIndex].count += 1;
    }

    sections.arAging = { supported: true, data: buckets };
  } catch (e: any) {
    sections.arAging = { supported: false, message: String(e?.message || "error building AR aging") };
  }

  // AP Aging
  try {
    const bills = await prisma.supplierBill.findMany({
      where: {
        tenantId: scope.tenantId,
        status: { not: "cancelled" },
      },
    });

    const payments = await prisma.supplierPayment.findMany({
      where: { tenantId: scope.tenantId },
    });

    // Group payments by bill
    const paymentsByBill = new Map<string, number>();
    for (const payment of payments) {
      const existing = paymentsByBill.get(payment.billId) || 0;
      paymentsByBill.set(payment.billId, existing + Number(payment.amount));
    }

    // Calculate aging buckets
    const now = new Date();
    const buckets: ApAgingBucket[] = [
      { bucket: "current", amount: 0, count: 0 },
      { bucket: "30", amount: 0, count: 0 },
      { bucket: "60", amount: 0, count: 0 },
      { bucket: "90", amount: 0, count: 0 },
      { bucket: "120+", amount: 0, count: 0 },
    ];

    for (const bill of bills) {
      const paid = paymentsByBill.get(bill.id) || 0;
      const outstanding = Number(bill.total) - paid;

      if (outstanding <= 0) continue;

      const daysPastDue = Math.floor((now.getTime() - bill.dueAt.getTime()) / (1000 * 60 * 60 * 24));

      let bucketIndex = 0;
      if (daysPastDue <= 0) bucketIndex = 0;
      else if (daysPastDue <= 30) bucketIndex = 1;
      else if (daysPastDue <= 60) bucketIndex = 2;
      else if (daysPastDue <= 90) bucketIndex = 3;
      else bucketIndex = 4;

      buckets[bucketIndex].amount += outstanding;
      buckets[bucketIndex].count += 1;
    }

    sections.apAging = { supported: true, data: buckets };
  } catch (e: any) {
    sections.apAging = { supported: false, message: String(e?.message || "error building AP aging") };
  }

  // VAT Summary
  try {
    const vatSummary = await buildVatSummary(scope, period);
    if (vatSummary.supported) {
      sections.vat = { supported: true, data: vatSummary.summary };
    } else {
      sections.vat = { supported: false, message: "Failed to build VAT summary" };
    }
  } catch (e: any) {
    sections.vat = { supported: false, message: String(e?.message || "error building VAT summary") };
  }

  // Key Journals
  try {
    const journals = await prisma.journalEntry.findMany({
      where: {
        tenantId: scope.tenantId,
        postedAt: { gte: startDate, lte: endDate },
      },
      include: {
        lines: {
          include: {
            account: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { postedAt: "desc" },
      take: 50, // Top 50 journals
    });

    sections.keyJournals = {
      supported: true,
      data: journals.map((j) => ({
        id: j.id,
        docRef: j.docRef,
        memo: j.memo,
        postedAt: j.postedAt,
        lines: j.lines.map((l) => ({
          accountCode: l.account.code,
          accountName: l.account.name,
          debit: Number(l.debit),
          credit: Number(l.credit),
        })),
      })),
    };
  } catch (e: any) {
    sections.keyJournals = { supported: false, message: String(e?.message || "error building key journals") };
  }

  return { period, sections };
}
