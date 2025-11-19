/**
 * Phase 9 — POS Variance
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface PosVarianceInput {
  sessionId: string;
  shiftId: string;
  type: string; // cash, card, etc.
  expected: number;
  actual: number;
  reason?: string;
}

export async function listVariances(
  scope: { tenantId: string; entityId?: string | null },
  sessionId?: string,
  shiftId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (sessionId) {
    where.sessionId = sessionId;
  }
  if (shiftId) {
    where.shiftId = shiftId;
  }

  const variances = await prisma.posVariance.findMany({
    where,
    include: {
      session: {
        select: { id: true, openedAt: true },
      },
      shift: {
        select: { id: true, openedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return variances;
}

export async function recordVariance(
  scope: { tenantId: string; entityId?: string | null },
  input: PosVarianceInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify session exists
  const session = await prisma.posSession.findFirst({
    where: { id: input.sessionId, tenantId: scope.tenantId },
  });

  if (!session) {
    throw Object.assign(new Error("Session not found"), { code: 404 });
  }

  // Verify shift exists
  const shift = await prisma.tillShift.findFirst({
    where: { id: input.shiftId, tenantId: scope.tenantId },
  });

  if (!shift) {
    throw Object.assign(new Error("Shift not found"), { code: 404 });
  }

  const variance = input.actual - input.expected;

  const varianceRecord = await prisma.posVariance.create({
    data: {
      tenantId: scope.tenantId,
      sessionId: input.sessionId,
      shiftId: input.shiftId,
      type: input.type,
      expected: input.expected,
      actual: input.actual,
      variance,
      reason: input.reason || null,
      resolved: false,
    },
    include: {
      session: {
        select: { id: true, openedAt: true },
      },
      shift: {
        select: { id: true, openedAt: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("pos.variance.recorded", {
      tenantId: scope.tenantId,
      varianceId: varianceRecord.id,
      sessionId: input.sessionId,
      shiftId: input.shiftId,
      variance,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: varianceRecord };
}

export async function resolveVariance(
  scope: { tenantId: string; entityId?: string | null },
  varianceId: string,
  resolvedBy: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const variance = await prisma.posVariance.findFirst({
    where: { id: varianceId, tenantId: scope.tenantId },
  });

  if (!variance) {
    throw Object.assign(new Error("Variance not found"), { code: 404 });
  }

  const updated = await prisma.posVariance.update({
    where: { id: varianceId },
    data: {
      resolved: true,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });

  // Audit log
  try {
    await auditEvent("pos.variance.resolved", {
      tenantId: scope.tenantId,
      varianceId,
      resolvedBy,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return { ok: true, data: updated };
}
