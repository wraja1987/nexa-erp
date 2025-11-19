/**
 * Phase 9 — POS Sessions
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";

export interface PosSessionInput {
  storeId: string;
  shiftId: string;
  openedBy: string;
  openingFloat: number;
}

export async function listSessions(
  scope: { tenantId: string; entityId?: string | null },
  storeId?: string,
  shiftId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (storeId) {
    where.storeId = storeId;
  }
  if (shiftId) {
    where.shiftId = shiftId;
  }

  const sessions = await prisma.posSession.findMany({
    where,
    include: {
      store: {
        select: { id: true, code: true, name: true },
      },
      shift: {
        select: { id: true, openedAt: true, closedAt: true },
      },
    },
    orderBy: { openedAt: "desc" },
  });

  return {
    sessions,
    meta: { supported: true },
  };
}

export async function openSession(
  scope: { tenantId: string; entityId?: string | null },
  input: PosSessionInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify store exists
  const store = await prisma.store.findFirst({
    where: { id: input.storeId, tenantId: scope.tenantId },
  });

  if (!store) {
    throw Object.assign(new Error("Store not found"), { code: 404 });
  }

  // Verify shift exists
  const shift = await prisma.tillShift.findFirst({
    where: { id: input.shiftId, tenantId: scope.tenantId },
  });

  if (!shift) {
    throw Object.assign(new Error("Shift not found"), { code: 404 });
  }

  const session = await prisma.posSession.create({
    data: {
      tenantId: scope.tenantId,
      storeId: input.storeId,
      shiftId: input.shiftId,
      openedBy: input.openedBy,
      openingFloat: input.openingFloat,
      status: "open",
    },
    include: {
      store: {
        select: { id: true, code: true, name: true },
      },
      shift: {
        select: { id: true, openedAt: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("pos.session.opened", {
      tenantId: scope.tenantId,
      sessionId: session.id,
      storeId: input.storeId,
      shiftId: input.shiftId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event (Phase 4C - Depth Pass)
  try {
    const type = await import("@/server/events/types");
    await publishWithOutbox<type.PosSessionOpened>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "pos.session.opened",
      occurredAt: nowIso(),
      source: "pos.sessions",
      version: 1,
      payload: {
        sessionId: session.id,
        storeId: input.storeId,
        shiftId: input.shiftId,
        openedBy: input.openedBy,
        openingFloat: input.openingFloat,
        openedAt: session.openedAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[POS] Failed to emit session.opened event:", error);
  }

  return { ok: true, data: session };
}

export async function closeSession(
  scope: { tenantId: string; entityId?: string | null },
  sessionId: string,
  closingFloat: number,
  closedBy: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const session = await prisma.posSession.findFirst({
    where: { id: sessionId, tenantId: scope.tenantId },
  });

  if (!session) {
    throw Object.assign(new Error("Session not found"), { code: 404 });
  }

  if (session.status === "closed") {
    throw Object.assign(new Error("Session already closed"), { code: 400 });
  }

  const updated = await prisma.posSession.update({
    where: { id: sessionId },
    data: {
      status: "closed",
      closedBy,
      closingFloat,
      closedAt: new Date(),
    },
    include: {
      store: {
        select: { id: true, code: true, name: true },
      },
      shift: {
        select: { id: true, openedAt: true, closedAt: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("pos.session.closed", {
      tenantId: scope.tenantId,
      sessionId,
      closingFloat,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event (Phase 4C - Depth Pass)
  try {
    const type = await import("@/server/events/types");
    await publishWithOutbox<type.PosSessionClosed>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "pos.session.closed",
      occurredAt: nowIso(),
      source: "pos.sessions",
      version: 1,
      payload: {
        sessionId,
        storeId: updated.storeId,
        shiftId: updated.shiftId,
        closedBy,
        closingFloat,
        openedAt: updated.openedAt.toISOString(),
        closedAt: updated.closedAt!.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[POS] Failed to emit session.closed event:", error);
  }

  return { ok: true, data: updated };
}

export async function getSession(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const session = await prisma.posSession.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      store: true,
      shift: true,
      PosVariance: true,
    },
  });

  return session;
}
