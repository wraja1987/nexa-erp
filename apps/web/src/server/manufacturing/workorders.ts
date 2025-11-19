import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { canStart, canComplete, canCancel } from "@/lib/manufacturing/lifecycle";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { ManufacturingWorkorderReleased, ManufacturingWorkorderCompleted } from "@/server/events/types";

export async function listWorkOrders(scope: { tenantId: string; entityId?: string | null }, filters?: { status?: string }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.workOrder.findMany({
    where: { tenantId: scope.tenantId, ...(filters?.status ? { status: filters.status as any } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function createWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  data: { number: string; itemCode: string; quantityMinor: number; startPlanned?: string; endPlanned?: string }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  if (!data.number || !data.itemCode || (data.quantityMinor ?? 0) <= 0) throw Object.assign(new Error("invalid_workorder"), { code: 400 });
  return prisma.workOrder.create({
    data: {
      tenantId: scope.tenantId,
      number: data.number,
      itemCode: data.itemCode,
      quantity: data.quantityMinor as any,
      startPlanned: data.startPlanned ? new Date(data.startPlanned) : null,
      endPlanned: data.endPlanned ? new Date(data.endPlanned) : null,
      status: "planned" as any,
    },
  });
}

export async function startWorkOrder(
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
      entityType: "manufacturing.workorder",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      actorRole,
      action: "start",
    });

    if (!workflowCheck.allowed) {
      throw Object.assign(new Error(workflowCheck.reason || "Workflow transition denied"), { code: 403 });
    }
  }

  const wo = await prisma.workOrder.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!wo) throw Object.assign(new Error("not_found"), { code: 404 });
  const previousState = wo.status as string;
  if (!canStart(wo.status as any)) throw Object.assign(new Error("illegal_transition"), { code: 400 });
  const updated = await prisma.workOrder.update({ where: { id }, data: { status: "released" as any, startActual: new Date() } });

  // Record workflow state change (if actorRole provided)
  if (actorRole && actorId) {
    const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    await recordWorkflowStateChange({
      entityType: "manufacturing.workorder",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      fromState: previousState,
      toState: "released",
      action: "start",
    }).catch(() => {
      // Ignore errors - workflow recording is best-effort
    });
  }

  // Publish event (after update completes)
  try {
    const event: ManufacturingWorkorderReleased = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "manufacturing.workorder.released",
      occurredAt: nowIso(),
      source: "manufacturing.workorder",
      version: 1,
      payload: {
        workOrderId: updated.id,
        number: updated.number,
        itemCode: updated.itemCode,
        quantity: Number(updated.quantity),
        releasedAt: updated.startActual?.toISOString() || nowIso(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[Manufacturing] Failed to publish workorder.released event:`, error);
  }

  return updated;
}

export async function completeWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  actorId?: string,
  actorRole?: string
) {
  // Workflow check (if actorRole provided)
  if (actorRole && actorId) {
    const { checkWorkflowTransition, recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    const workflowCheck = await checkWorkflowTransition({
      entityType: "manufacturing.workorder",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      actorRole,
      action: "complete",
    });

    if (!workflowCheck.allowed) {
      throw Object.assign(new Error(workflowCheck.reason || "Workflow transition denied"), { code: 403 });
    }
  }

  const wo = await prisma.workOrder.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!wo) throw Object.assign(new Error("not_found"), { code: 404 });
  const previousState = wo.status as string;
  if (!canComplete(wo.status as any)) throw Object.assign(new Error("illegal_transition"), { code: 400 });
  const updated = await prisma.workOrder.update({ where: { id }, data: { status: "completed" as any, endActual: new Date() } });

  // Record workflow state change (if actorRole provided)
  if (actorRole && actorId) {
    const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    await recordWorkflowStateChange({
      entityType: "manufacturing.workorder",
      entityId: id,
      tenantId: scope.tenantId,
      actorId,
      fromState: previousState,
      toState: "completed",
      action: "complete",
    }).catch(() => {
      // Ignore errors - workflow recording is best-effort
    });
  }

  // Publish event (after update completes)
  try {
    const event: ManufacturingWorkorderCompleted = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "manufacturing.workorder.completed",
      occurredAt: nowIso(),
      source: "manufacturing.workorder",
      version: 1,
      payload: {
        workOrderId: updated.id,
        number: updated.number,
        itemCode: updated.itemCode,
        quantityCompleted: Number(updated.quantity),
        completedAt: updated.endActual?.toISOString() || nowIso(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[Manufacturing] Failed to publish workorder.completed event:`, error);
  }

  return updated;
}

export async function cancelWorkOrder(
  scope: { tenantId: string; entityId?: string | null },
  id: string,
  actorId?: string,
  actorRole?: string
) {
  // Workflow check (if actorRole provided)
  if (actorRole && actorId) {
    const { checkWorkflowTransition, recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    const workflowCheck = await checkWorkflowTransition({
      entityType: "manufacturing.workorder",
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

  const wo = await prisma.workOrder.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!wo) throw Object.assign(new Error("not_found"), { code: 404 });
  const previousState = wo.status as string;
  if (!canCancel(wo.status as any)) throw Object.assign(new Error("illegal_transition"), { code: 400 });
  const updated = await prisma.workOrder.update({ where: { id }, data: { status: "cancelled" as any } });

  // Record workflow state change (if actorRole provided)
  if (actorRole && actorId) {
    const { recordWorkflowStateChange } = await import("@/server/workflow/enforcer");
    await recordWorkflowStateChange({
      entityType: "manufacturing.workorder",
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


