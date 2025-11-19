import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { canApprove, canCancel } from "@/lib/purchasing/po-lifecycle";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { PurchasingPoApproved } from "@/server/events/types";

export async function listPurchaseOrders(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.purchaseOrder.findMany({
    where: { tenantId: scope.tenantId },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getPurchaseOrder(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const po = await prisma.purchaseOrder.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: { supplier: true, lines: true },
  });
  if (!po) throw Object.assign(new Error("not_found"), { code: 404 });
  return po;
}

export async function createPurchaseOrder(
  scope: { tenantId: string; entityId?: string | null },
  data: { number: string; supplierId: string; currency?: string; orderDate?: string; expectedAt?: string }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!data.number || !data.supplierId) throw Object.assign(new Error("invalid_po"), { code: 400 });
  // Validate supplier belongs to tenant
  const sup = await prisma.supplier.findFirst({ where: { id: data.supplierId, tenantId: scope.tenantId } });
  if (!sup) throw Object.assign(new Error("invalid_supplier"), { code: 400 });
  return prisma.purchaseOrder.create({
    data: {
      tenantId: scope.tenantId,
      number: data.number,
      supplierId: data.supplierId,
      currency: data.currency || "GBP",
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      expectedAt: data.expectedAt ? new Date(data.expectedAt) : null,
      status: "draft" as any,
    },
  });
}

export async function updatePurchaseOrder(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  data: { currency?: string; orderDate?: string; expectedAt?: string }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const po = await prisma.purchaseOrder.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!po) throw Object.assign(new Error("not_found"), { code: 404 });
  return prisma.purchaseOrder.update({
    where: { id },
    data: {
      currency: data.currency ?? po.currency,
      orderDate: data.orderDate ? new Date(data.orderDate) : po.orderDate,
      expectedAt: data.expectedAt ? new Date(data.expectedAt) : po.expectedAt,
    },
  });
}

export async function approvePurchaseOrder(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  actorId?: string,
  actorRole?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  // Workflow check (if actorRole provided)
  if (actorRole && actorId) {
    const { checkWorkflowTransition, recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    const workflowCheck = await checkWorkflowTransition({
      entityType: "purchasing.po",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      actorRole,
      action: "approve",
    });

    if (!workflowCheck.allowed) {
      throw Object.assign(new Error(workflowCheck.reason || "Workflow transition denied"), { code: 403 });
    }
  }

  const po = await prisma.purchaseOrder.findFirst({ where: { id, tenantId: scope.tenantId }, include: { supplier: true, lines: true } });
  if (!po) throw Object.assign(new Error("not_found"), { code: 404 });
  const previousState = po.status as string;
  if (!canApprove(po.status as any)) throw Object.assign(new Error("illegal_transition"), { code: 400 });
  const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: "approved" as any } });

  // Record workflow state change (if actorRole provided)
  if (actorRole && actorId) {
    const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    await recordWorkflowStateChange({
      entityType: "purchasing.po",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      fromState: previousState,
      toState: "approved",
      action: "approve",
    }).catch(() => {
      // Ignore errors - workflow recording is best-effort
    });
  }

  // Publish event (after update completes)
  try {
    const total = po.lines.reduce((sum, line) => sum + Number(line.qty) * Number(line.price), 0);
    const event: PurchasingPoApproved = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "purchasing.po.approved",
      occurredAt: nowIso(),
      source: "purchasing.po",
      version: 1,
      payload: {
        poId: updated.id,
        number: updated.number,
        supplierCode: po.supplier.code,
        totalMinor: total * 100,
        currencyCode: updated.currency,
        approvedAt: nowIso(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[Purchasing] Failed to publish po.approved event:`, error);
  }

  return updated;
}

export async function cancelPurchaseOrder(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  actorId?: string,
  actorRole?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  // Workflow check (if actorRole provided)
  if (actorRole && actorId) {
    const { checkWorkflowTransition, recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    const workflowCheck = await checkWorkflowTransition({
      entityType: "purchasing.po",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      actorRole,
      action: "cancel",
    });

    if (!workflowCheck.allowed) {
      throw Object.assign(new Error(workflowCheck.reason || "Workflow transition denied"), { code: 403 });
    }
  }

  const po = await prisma.purchaseOrder.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!po) throw Object.assign(new Error("not_found"), { code: 404 });
  const previousState = po.status as string;
  if (!canCancel(po.status as any)) throw Object.assign(new Error("illegal_transition"), { code: 400 });
  const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: "cancelled" as any } });

  // Record workflow state change (if actorRole provided)
  if (actorRole && actorId) {
    const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    await recordWorkflowStateChange({
      entityType: "purchasing.po",
      entityId: id,
      tenantId: scope.tenantId,
      actorId: actorId!,
      fromState: previousState,
      toState: "cancelled",
      action: "cancel",
    }).catch(() => {
      // Ignore errors - workflow recording is best-effort
    });
  }

  return updated;
}


