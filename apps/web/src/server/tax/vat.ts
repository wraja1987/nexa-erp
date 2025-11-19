/**
 * Phase 10 — VAT Services
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface VatSummary {
  period: { start?: string; end?: string };
  boxes: {
    box1?: number; // VAT due on sales
    box2?: number; // VAT due on acquisitions
    box3?: number; // Total VAT due
    box4?: number; // VAT reclaimed
    box5?: number; // Net VAT
    box6?: number; // Total sales
    box7?: number; // Total purchases
  };
  totalSales: number;
  totalPurchases: number;
  vatOnSales: number;
  vatOnPurchases: number;
}

export async function buildVatSummary(
  scope: { tenantId: string; entityId?: string | null },
  period?: { start?: string; end?: string }
): Promise<{ supported: true; summary: VatSummary; period?: { start?: string; end?: string } }> {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const startDate = period?.start ? new Date(period.start) : new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
  const endDate = period?.end ? new Date(period.end) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  // Get standard VAT rate (20% UK standard rate)
  const standardRate = 0.20;

  // Calculate VAT on sales (output VAT)
  const salesInvoices = await prisma.customerInvoice.findMany({
    where: {
      tenantId: scope.tenantId,
      issuedAt: { gte: startDate, lte: endDate },
      status: { not: "cancelled" },
    },
  });

  let totalSales = 0;
  let vatOnSales = 0;

  for (const inv of salesInvoices) {
    const total = Number(inv.total);
    totalSales += total;
    // Calculate VAT assuming standard rate (net = total / 1.20, VAT = total - net)
    const net = total / (1 + standardRate);
    vatOnSales += total - net;
  }

  // Calculate VAT on purchases (input VAT)
  const purchaseBills = await prisma.supplierBill.findMany({
    where: {
      tenantId: scope.tenantId,
      receivedAt: { gte: startDate, lte: endDate },
      status: { not: "cancelled" },
    },
  });

  let totalPurchases = 0;
  let vatOnPurchases = 0;

  for (const bill of purchaseBills) {
    const total = Number(bill.total);
    totalPurchases += total;
    // Calculate VAT assuming standard rate
    const net = total / (1 + standardRate);
    vatOnPurchases += total - net;
  }

  // Build VAT boxes (UK VAT return format)
  const box1 = vatOnSales; // VAT due on sales
  const box2 = 0; // VAT due on acquisitions (EU imports - simplified to 0)
  const box3 = box1 + box2; // Total VAT due
  const box4 = vatOnPurchases; // VAT reclaimed
  const box5 = box3 - box4; // Net VAT
  const box6 = totalSales; // Total sales
  const box7 = totalPurchases; // Total purchases

  const summary: VatSummary = {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    boxes: {
      box1,
      box2,
      box3,
      box4,
      box5,
      box6,
      box7,
    },
    totalSales,
    totalPurchases,
    vatOnSales,
    vatOnPurchases,
  };

  return { supported: true, summary, period };
}

export async function listVatReturns(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const returns = await prisma.vatReturn.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return {
    returns,
    meta: { supported: true },
  };
}

export async function createDraftVatReturn(
  scope: { tenantId: string; entityId?: string | null },
  period: { start: Date; end: Date; periodKey: string },
  vrn: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Build VAT summary for the period
  const summary = await buildVatSummary(scope, {
    start: period.start.toISOString(),
    end: period.end.toISOString(),
  });

  if (!summary.supported) {
    throw Object.assign(new Error("Failed to build VAT summary"), { code: 500 });
  }

  // Calculate due date (typically 1 month + 7 days after period end)
  const dueDate = new Date(period.end);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(dueDate.getDate() + 7);

  // Create draft return
  const vatReturn = await prisma.vatReturn.create({
    data: {
      tenantId: scope.tenantId,
      vrn,
      periodKey: period.periodKey,
      start: period.start,
      end: period.end,
      due: dueDate,
      status: "draft",
      totalDue: summary.summary.boxes.box5 || null,
    },
  });

  // Audit log
  try {
    await auditEvent("tax.vat.return.created", {
      tenantId: scope.tenantId,
      vatReturnId: vatReturn.id,
      periodKey: period.periodKey,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: vatReturn };
}
