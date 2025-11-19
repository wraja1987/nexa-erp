/**
 * Phase 7 — Project Retainers
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface RetainerInput {
  projectId: string;
  amount: number;
}

export async function listRetainers(
  scope: { tenantId: string; entityId?: string | null },
  projectId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (projectId) {
    where.projectId = projectId;
  }

  const retainers = await prisma.projectRetainer.findMany({
    where,
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return retainers;
}

export async function createRetainer(
  scope: { tenantId: string; entityId?: string | null },
  input: RetainerInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify project exists
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, tenantId: scope.tenantId },
  });

  if (!project) {
    throw Object.assign(new Error("Project not found"), { code: 404 });
  }

  const retainer = await prisma.projectRetainer.create({
    data: {
      tenantId: scope.tenantId,
      projectId: input.projectId,
      amount: input.amount,
      applied: 0,
      status: "active",
    },
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("projects.retainer.created", {
      tenantId: scope.tenantId,
      retainerId: retainer.id,
      projectId: input.projectId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return retainer;
}

export async function applyRetainer(
  scope: { tenantId: string; entityId?: string | null },
  retainerId: string,
  amount: number,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const retainer = await prisma.projectRetainer.findFirst({
    where: { id: retainerId, tenantId: scope.tenantId },
  });

  if (!retainer) {
    throw Object.assign(new Error("Retainer not found"), { code: 404 });
  }

  const newApplied = Number(retainer.applied) + amount;
  if (newApplied > Number(retainer.amount)) {
    throw Object.assign(new Error("Cannot apply more than retainer amount"), { code: 400 });
  }

  const updated = await prisma.projectRetainer.update({
    where: { id: retainerId },
    data: {
      applied: newApplied,
      ...(newApplied >= Number(retainer.amount) && { status: "exhausted" }),
    },
  });

  // Audit log
  try {
    await auditEvent("projects.retainer.applied", {
      tenantId: scope.tenantId,
      retainerId,
      amount,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
