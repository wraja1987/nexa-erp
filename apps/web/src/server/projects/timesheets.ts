/**
 * Phase 7 — Timesheets
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import { getEmployeeBillingRate } from "./rates";

export interface TimesheetEntryInput {
  projectId: string;
  phaseId?: string;
  employeeId: string;
  date: Date;
  hours: number;
  description?: string;
}

export async function listTimesheets(
  scope: { tenantId: string; entityId?: string | null },
  projectId?: string,
  employeeId?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (projectId) {
    where.projectId = projectId;
  }
  if (employeeId) {
    where.employeeId = employeeId;
  }

  const timesheets = await prisma.timesheet.findMany({
    where,
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
      phase: {
        select: { id: true, code: true, name: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return timesheets;
}

export async function createTimesheetEntry(
  scope: { tenantId: string; entityId?: string | null },
  input: TimesheetEntryInput,
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

  // Verify phase exists if provided
  if (input.phaseId) {
    const phase = await prisma.projectPhase.findFirst({
      where: { id: input.phaseId, projectId: input.projectId },
    });
    if (!phase) {
      throw Object.assign(new Error("Phase not found"), { code: 404 });
    }
  }

  // Verify employee exists
  const employee = await prisma.employee.findFirst({
    where: { id: input.employeeId, tenantId: scope.tenantId },
  });

  if (!employee) {
    throw Object.assign(new Error("Employee not found"), { code: 404 });
  }

  const timesheet = await prisma.timesheet.create({
    data: {
      tenantId: scope.tenantId,
      projectId: input.projectId,
      phaseId: input.phaseId || null,
      employeeId: input.employeeId,
      date: input.date,
      hours: input.hours,
      description: input.description || null,
      status: "draft",
    },
    include: {
      project: {
        select: { id: true, code: true, name: true },
      },
      phase: {
        select: { id: true, code: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("projects.timesheet.created", {
      tenantId: scope.tenantId,
      timesheetId: timesheet.id,
      projectId: input.projectId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return timesheet;
}

export async function approveTimesheet(
  scope: { tenantId: string; entityId?: string | null },
  timesheetId: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const timesheet = await prisma.timesheet.findFirst({
    where: { id: timesheetId, tenantId: scope.tenantId },
  });

  if (!timesheet) {
    throw Object.assign(new Error("Timesheet not found"), { code: 404 });
  }

  const updated = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: {
      status: "approved",
      approvedBy: actorId,
      approvedAt: new Date(),
    },
    include: {
      project: true,
      phase: true,
      employee: true,
    },
  });

  // Post to WIP Ledger (Phase 5A - Depth Pass)
  try {
    // Get employee billing rate (Phase 5A: uses configurable default)
    const employeeRate = await getEmployeeBillingRate(scope.tenantId, updated.employeeId);
    const wipAmount = Number(updated.hours) * employeeRate;

    await prisma.wipLedger.create({
      data: {
        tenantId: scope.tenantId,
        projectId: updated.projectId,
        phaseId: updated.phaseId || null,
        type: "timesheet",
        referenceId: timesheetId,
        description: `Timesheet: ${updated.employee.name || updated.employeeId} - ${Number(updated.hours)} hours`,
        amount: wipAmount,
        currency: "GBP",
        postedAt: new Date(),
        billed: false,
      },
    });
  } catch (error) {
    // Log but don't fail - WIP posting is best-effort
    console.error("[Projects] Failed to post timesheet to WIP:", error);
  }

  // Audit log
  try {
    await auditEvent("projects.timesheet.approved", {
      tenantId: scope.tenantId,
      timesheetId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event (Phase 4B)
  try {
    const type = await import("@/server/events/types");
    await publishWithOutbox<type.ProjectsTimesheetPosted>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "projects.timesheet.posted",
      occurredAt: nowIso(),
      source: "projects.timesheets",
      version: 1,
      payload: {
        timesheetId,
        projectId: updated.projectId,
        phaseId: updated.phaseId || undefined,
        employeeId: updated.employeeId,
        hours: Number(updated.hours),
        postedAt: updated.approvedAt!.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[Projects] Failed to emit timesheet.posted event:", error);
  }

  return updated;
}
