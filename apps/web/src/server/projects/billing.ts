/**
 * Phase 7 — Project Billing
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import { calculateTaxForLines } from "@/server/tax/service";

export type BillingMode = "TIME_AND_MATERIALS" | "MILESTONE" | "FIXED_FEE";

export interface BillingPreviewLine {
  projectId: string;
  phaseId?: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface BillingPreview {
  projectId: string;
  mode: BillingMode;
  total: number;
  lines: BillingPreviewLine[];
}

export async function buildBillingPreview(
  scope: { tenantId: string; entityId?: string | null },
  projectId: string,
  mode: BillingMode
): Promise<BillingPreview> {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId: scope.tenantId },
    include: {
      phases: true,
      timesheets: {
        where: { status: "approved" },
        include: {
          phase: true,
        },
      },
      WipLedger: {
        where: { billed: false },
        orderBy: { postedAt: "asc" },
      },
    },
  });

  if (!project) {
    throw Object.assign(new Error("Project not found"), { code: 404 });
  }

  const lines: BillingPreviewLine[] = [];

  if (mode === "TIME_AND_MATERIALS") {
    // Use WIP Ledger entries (Phase 4B - Depth Pass)
    const wipByPhase = new Map<string, { amount: number; phaseId?: string; descriptions: string[] }>();
    
    for (const wip of project.WipLedger) {
      const key = wip.phaseId || "no-phase";
      const existing = wipByPhase.get(key) || { amount: 0, phaseId: wip.phaseId || undefined, descriptions: [] };
      existing.amount += Number(wip.amount);
      existing.descriptions.push(wip.description);
      wipByPhase.set(key, existing);
    }

    // Build lines from WIP
    for (const [key, group] of wipByPhase.entries()) {
      const phase = group.phaseId ? project.phases.find((p) => p.id === group.phaseId) : null;
      lines.push({
        projectId,
        phaseId: group.phaseId || undefined,
        description: phase 
          ? `Phase ${phase.code}: ${group.descriptions.join(", ")}`
          : `Project WIP: ${group.descriptions.join(", ")}`,
        qty: 1,
        rate: group.amount,
        amount: group.amount,
      });
    }
  } else if (mode === "MILESTONE") {
    // Use phase budgets as milestones
    for (const phase of project.phases) {
      if (phase.budget) {
        lines.push({
          projectId,
          phaseId: phase.id,
          description: `Milestone: ${phase.name}`,
          qty: 1,
          rate: Number(phase.budget),
          amount: Number(phase.budget),
        });
      }
    }
  } else if (mode === "FIXED_FEE") {
    // Use project budget
    if (project.budget) {
      lines.push({
        projectId,
        description: `Fixed fee: ${project.name}`,
        qty: 1,
        rate: Number(project.budget),
        amount: Number(project.budget),
      });
    }
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return {
    projectId,
    mode,
    total,
    lines,
  };
}

export async function createProjectInvoice(
  scope: { tenantId: string; entityId?: string | null },
  projectId: string,
  preview: BillingPreview,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId: scope.tenantId },
  });

  if (!project) {
    throw Object.assign(new Error("Project not found"), { code: 404 });
  }

  if (!project.customerId) {
    throw Object.assign(new Error("Project has no customer"), { code: 400 });
  }

  // Generate invoice number
  const invoiceNumber = `INV-${project.code}-${Date.now()}`;

  // Create invoice header
  const invoice = await prisma.customerInvoice.create({
    data: {
      tenantId: scope.tenantId,
      number: invoiceNumber,
      customerId: project.customerId,
      currency: "GBP",
      total: preview.total,
      status: "draft",
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Calculate tax (Phase 4B - Depth Pass)
  const taxCalculation = await calculateTaxForLines(
    scope.tenantId,
    preview.lines.map((line) => ({
      subtotal: line.amount,
      customerId: project.customerId || undefined,
    })),
    "UK"
  );

  const invoiceTotal = taxCalculation.total.total;
  const invoiceTax = taxCalculation.total.taxAmount;

  // Update invoice with tax-inclusive total
  const finalInvoice = await prisma.customerInvoice.update({
    where: { id: invoice.id },
    data: { total: invoiceTotal },
  });

  // Create invoice lines linked to project/phases
  for (const line of preview.lines) {
    await prisma.projectInvoiceLine.create({
      data: {
        invoiceId: finalInvoice.id,
        projectId: line.projectId,
        phaseId: line.phaseId || null,
        description: line.description,
        qty: line.qty,
        rate: line.rate,
        amount: line.amount,
      },
    });
  }

  // Mark WIP entries as billed (Phase 4B - Depth Pass)
  if (preview.mode === "TIME_AND_MATERIALS") {
    await prisma.wipLedger.updateMany({
      where: {
        tenantId: scope.tenantId,
        projectId,
        billed: false,
      },
      data: {
        billed: true,
        invoiceId: finalInvoice.id,
      },
    });
  }

  // Audit log
  try {
    await auditEvent("projects.invoice.created", {
      tenantId: scope.tenantId,
      invoiceId: finalInvoice.id,
      projectId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event (Phase 4B)
  try {
    const type = await import("@/server/events/types");
    await publishWithOutbox<type.ProjectsInvoiceCreated>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "projects.invoice.created",
      occurredAt: nowIso(),
      source: "projects.billing",
      version: 1,
      payload: {
        invoiceId: finalInvoice.id,
        projectId,
        customerId: project.customerId!,
        number: finalInvoice.number,
        total: Number(finalInvoice.total),
        tax: invoiceTax,
        currency: finalInvoice.currency,
        issuedAt: finalInvoice.issuedAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Projects] Failed to emit project.invoice.created event:", error);
  }

  return finalInvoice;
}
