/**
 * Phase 10 — HMRC MTD Services
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { buildVatSummary } from "./vat";
import { auditEvent } from "@/lib/observability/audit";

export interface MtdPayload {
  periodKey: string;
  vatDueSales: number;
  vatDueAcquisitions: number;
  totalVatDue: number;
  vatReclaimedCurrPeriod: number;
  netVatDue: number;
  totalValueSalesExVAT: number;
  totalValuePurchasesExVAT: number;
  totalValueGoodsSuppliedExVAT: number;
  totalAcquisitionsExVAT: number;
}

export async function buildMtdPayload(
  scope: { tenantId: string; entityId?: string | null },
  vatReturnId: string
): Promise<{ supported: true; payload: MtdPayload }> {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const vatReturn = await prisma.vatReturn.findFirst({
    where: { id: vatReturnId, tenantId: scope.tenantId },
  });

  if (!vatReturn) {
    throw Object.assign(new Error("VAT return not found"), { code: 404 });
  }

  // Build VAT summary for the return period
  const summary = await buildVatSummary(scope, {
    start: vatReturn.start.toISOString(),
    end: vatReturn.end.toISOString(),
  });

  if (!summary.supported || !summary.summary) {
    throw Object.assign(new Error("Failed to build VAT summary"), { code: 500 });
  }

  const boxes = summary.summary.boxes;

  // Build HMRC MTD payload (simplified format)
  const payload: MtdPayload = {
    periodKey: vatReturn.periodKey,
    vatDueSales: boxes.box1 || 0,
    vatDueAcquisitions: boxes.box2 || 0,
    totalVatDue: boxes.box3 || 0,
    vatReclaimedCurrPeriod: boxes.box4 || 0,
    netVatDue: boxes.box5 || 0,
    totalValueSalesExVAT: summary.summary.totalSales - (boxes.box1 || 0),
    totalValuePurchasesExVAT: summary.summary.totalPurchases - (boxes.box4 || 0),
    totalValueGoodsSuppliedExVAT: summary.summary.totalSales - (boxes.box1 || 0),
    totalAcquisitionsExVAT: 0, // Simplified
  };

  return { supported: true, payload };
}

export async function recordMtdSubmissionResult(
  scope: { tenantId: string; entityId?: string | null },
  vatReturnId: string,
  submissionId: string,
  status: "submitted" | "accepted" | "rejected",
  response?: Record<string, unknown>,
  actorId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const vatReturn = await prisma.vatReturn.findFirst({
    where: { id: vatReturnId, tenantId: scope.tenantId },
  });

  if (!vatReturn) {
    throw Object.assign(new Error("VAT return not found"), { code: 404 });
  }

  // Check if submission already exists
  const existing = await prisma.hmrcMtdSubmission.findFirst({
    where: { tenantId: scope.tenantId, vatReturnId },
  });

  const submission = existing
    ? await prisma.hmrcMtdSubmission.update({
        where: { id: existing.id },
        data: {
          submissionId,
          status,
          submittedAt: new Date(),
          response: response || null,
        },
      })
    : await prisma.hmrcMtdSubmission.create({
        data: {
          tenantId: scope.tenantId,
          vatReturnId,
          submissionId,
          status,
          submittedAt: new Date(),
          response: response || null,
        },
      });

  // Update VAT return status if accepted
  if (status === "accepted") {
    await prisma.vatReturn.update({
      where: { id: vatReturnId },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  }

  // Audit log
  try {
    await auditEvent("tax.hmrc.mtd.submitted", {
      tenantId: scope.tenantId,
      vatReturnId,
      submissionId,
      status,
      actorId: actorId || "system",
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: submission };
}
