/**
 * Phase 7 — Projects/PSA
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface ProjectInput {
  code: string;
  name: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
}

export interface ProjectPhaseInput {
  projectId: string;
  code: string;
  name: string;
  budget?: number;
}

export async function listProjects(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const projects = await prisma.project.findMany({
    where: { tenantId: scope.tenantId },
    include: {
      phases: true,
      retainers: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

export async function getProject(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const project = await prisma.project.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      phases: {
        include: {
          tasks: true,
          timesheets: true,
        },
      },
      tasks: true,
      timesheets: true,
      retainers: true,
    },
  });

  if (!project) {
    throw Object.assign(new Error("Project not found"), { code: 404 });
  }

  return project;
}

export async function createProject(
  scope: { tenantId: string; entityId?: string | null },
  input: ProjectInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify customer exists if provided
  if (input.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, tenantId: scope.tenantId },
    });
    if (!customer) {
      throw Object.assign(new Error("Customer not found"), { code: 404 });
    }
  }

  const project = await prisma.project.create({
    data: {
      tenantId: scope.tenantId,
      code: input.code,
      name: input.name,
      customerId: input.customerId || null,
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      budget: input.budget || null,
      status: "active",
    },
    include: {
      phases: true,
    },
  });

  // Audit log
  try {
    await auditEvent("projects.project.created", {
      tenantId: scope.tenantId,
      projectId: project.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return project;
}

export async function updateProject(
  scope: { tenantId: string; entityId?: string | null },
  projectId: string,
  input: Partial<ProjectInput & { status: string }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId: scope.tenantId },
  });

  if (!project) {
    throw Object.assign(new Error("Project not found"), { code: 404 });
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.customerId !== undefined && { customerId: input.customerId || null }),
      ...(input.startDate !== undefined && { startDate: input.startDate || null }),
      ...(input.endDate !== undefined && { endDate: input.endDate || null }),
      ...(input.budget !== undefined && { budget: input.budget || null }),
      ...(input.status && { status: input.status }),
    },
    include: {
      phases: true,
    },
  });

  // Audit log
  try {
    await auditEvent("projects.project.updated", {
      tenantId: scope.tenantId,
      projectId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}

// Phases
export async function listPhases(scope: { tenantId: string; entityId?: string | null }, projectId?: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (projectId) {
    where.projectId = projectId;
  }

  const phases = await prisma.projectPhase.findMany({
    where,
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return phases;
}

export async function createPhase(
  scope: { tenantId: string; entityId?: string | null },
  input: ProjectPhaseInput,
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

  const phase = await prisma.projectPhase.create({
    data: {
      projectId: input.projectId,
      code: input.code,
      name: input.name,
      budget: input.budget || null,
      status: "active",
    },
  });

  // Audit log
  try {
    await auditEvent("projects.phase.created", {
      tenantId: scope.tenantId,
      phaseId: phase.id,
      projectId: input.projectId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return phase;
}

export async function updatePhase(
  scope: { tenantId: string; entityId?: string | null },
  phaseId: string,
  input: Partial<ProjectPhaseInput & { status: string }>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const phase = await prisma.projectPhase.findFirst({
    where: { id: phaseId },
    include: { project: true },
  });

  if (!phase || phase.project.tenantId !== scope.tenantId) {
    throw Object.assign(new Error("Phase not found"), { code: 404 });
  }

  const updated = await prisma.projectPhase.update({
    where: { id: phaseId },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.budget !== undefined && { budget: input.budget || null }),
      ...(input.status && { status: input.status }),
    },
  });

  // Audit log
  try {
    await auditEvent("projects.phase.updated", {
      tenantId: scope.tenantId,
      phaseId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}
