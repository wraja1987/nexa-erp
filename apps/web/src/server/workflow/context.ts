/**
 * Phase 24 — Workflow Context Builders
 * 
 * Helpers to build WorkflowContext from existing entities.
 */

import { prisma } from "@/lib/prisma";
import type { WorkflowContext } from "./types";
import { normalizeRole } from "@/lib/rbac/matrix";

/**
 * Build workflow context for an invoice
 */
export async function buildInvoiceContext(
  invoiceId: string,
  tenantId: string,
  actorId: string,
  actorRole: string
): Promise<WorkflowContext> {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: invoiceId },
    include: { lines: true },
  });

  if (!invoice || invoice.tenantId !== tenantId) {
    throw Object.assign(new Error("Invoice not found"), { code: 404 });
  }

  // Calculate total amount
  const total = invoice.lines.reduce((sum, line) => {
    return sum + Number(line.qty || 0) * Number(line.price || 0);
  }, 0);

  return {
    tenantId,
    entityType: "finance.invoice",
    entityId: invoiceId,
    currentState: invoice.status as string,
    actorId,
    actorRole: normalizeRole(actorRole),
    amount: total,
    dimensions: {}, // Stubbed: cost centre, department not available in current schema
  };
}

/**
 * Build workflow context for a purchase order
 */
export async function buildPoContext(
  poId: string,
  tenantId: string,
  actorId: string,
  actorRole: string
): Promise<WorkflowContext> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { lines: true },
  });

  if (!po || po.tenantId !== tenantId) {
    throw Object.assign(new Error("Purchase order not found"), { code: 404 });
  }

  // Calculate total amount
  const total = po.lines.reduce((sum, line) => {
    return sum + Number(line.qty || 0) * Number(line.price || 0);
  }, 0);

  return {
    tenantId,
    entityType: "purchasing.po",
    entityId: poId,
    currentState: po.status as string,
    actorId,
    actorRole: normalizeRole(actorRole),
    amount: total,
    dimensions: {}, // Stubbed: cost centre, department not available in current schema
  };
}

/**
 * Build workflow context for a work order
 */
export async function buildWorkOrderContext(
  workOrderId: string,
  tenantId: string,
  actorId: string,
  actorRole: string
): Promise<WorkflowContext> {
  const wo = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
  });

  if (!wo || wo.tenantId !== tenantId) {
    throw Object.assign(new Error("Work order not found"), { code: 404 });
  }

  // Work orders don't have a direct "amount" field
  // We could calculate from BOM cost, but for now use quantity as a proxy
  const amount = Number(wo.quantity || 0);

  return {
    tenantId,
    entityType: "manufacturing.workorder",
    entityId: workOrderId,
    currentState: wo.status as string,
    actorId,
    actorRole: normalizeRole(actorRole),
    amount, // Using quantity as proxy for amount-based conditions
    dimensions: {}, // Stubbed: resource, work center not available in current schema
  };
}

/**
 * Build workflow context generically
 */
export async function buildWorkflowContext(
  entityType: string,
  entityId: string,
  tenantId: string,
  actorId: string,
  actorRole: string
): Promise<WorkflowContext> {
  switch (entityType) {
    case "finance.invoice":
      return buildInvoiceContext(entityId, tenantId, actorId, actorRole);
    case "purchasing.po":
      return buildPoContext(entityId, tenantId, actorId, actorRole);
    case "manufacturing.workorder":
      return buildWorkOrderContext(entityId, tenantId, actorId, actorRole);
    default:
      throw Object.assign(
        new Error(`Unsupported entity type: ${entityType}`),
        { code: 400 }
      );
  }
}

