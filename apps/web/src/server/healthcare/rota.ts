/**
 * Phase 14 — Rota Management
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

export type RotaInfo = {
  id: string;
  practiceId: string;
  practiceName?: string;
  weekStart: Date;
  weekEnd: Date;
  shiftCount?: number;
  createdAt?: Date;
};

export type RotaShift = {
  id: string;
  rotaId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  role?: string;
  assignmentCount?: number;
};

export type RotaAssignment = {
  id: string;
  shiftId: string;
  employeeId: string;
  employeeName?: string;
  arrsRoleId?: string;
  arrsRoleName?: string;
  locumId?: string;
};

export type RotaListResult = {
  supported: boolean;
  rotas: RotaInfo[];
  total?: number;
  message?: string;
};

export type RotaShiftsResult = {
  supported: boolean;
  shifts: RotaShift[];
  assignments?: RotaAssignment[];
  message?: string;
};

/**
 * List rotas for tenant.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listRotas(
  tenantId: string,
  filters?: { practiceId?: string; startDate?: Date; endDate?: Date }
): Promise<RotaListResult> {
  try {
    const where: any = { tenantId };
    if (filters?.practiceId) {
      where.practiceId = filters.practiceId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.OR = [];
      if (filters.startDate) {
        where.OR.push({ weekEnd: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.OR.push({ weekStart: { lte: filters.endDate } });
      }
    }

    const rotas = await prisma.healthcareRotaHeader.findMany({
      where,
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          },
        },
        shifts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { weekStart: "desc" },
    });

    const rotaInfos: RotaInfo[] = rotas.map((r) => ({
      id: r.id,
      practiceId: r.practiceId,
      practiceName: r.practice.name,
      weekStart: r.weekStart,
      weekEnd: r.weekEnd,
      shiftCount: r.shifts.length,
      createdAt: r.createdAt,
    }));

    return {
      supported: true,
      rotas: rotaInfos,
      total: rotaInfos.length,
    };
  } catch (e: any) {
    return {
      supported: false,
      rotas: [],
      message: `Failed to list rotas: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * List shifts for a rota.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listShiftsForRota(tenantId: string, rotaId: string): Promise<RotaShiftsResult> {
  try {
    // Verify rota exists and belongs to tenant
    const rota = await prisma.healthcareRotaHeader.findFirst({
      where: {
        id: rotaId,
        tenantId,
      },
    });

    if (!rota) {
      return {
        supported: false,
        shifts: [],
        message: "Rota not found",
      };
    }

    const shifts = await prisma.healthcareRotaShift.findMany({
      where: { headerId: rotaId },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const shiftInfos: RotaShift[] = shifts.map((s) => ({
      id: s.id,
      rotaId: s.headerId,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      role: s.role || undefined,
      assignmentCount: s.assignments.length,
    }));

    // Flatten assignments
    const assignments: RotaAssignment[] = [];
    for (const shift of shifts) {
      for (const assignment of shift.assignments) {
        assignments.push({
          id: assignment.id,
          shiftId: assignment.shiftId,
          employeeId: assignment.employeeId,
          employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
          arrsRoleId: assignment.arrsRoleId || undefined,
          locumId: assignment.locumId || undefined,
        });
      }
    }

    return {
      supported: true,
      shifts: shiftInfos,
      assignments,
    };
  } catch (e: any) {
    return {
      supported: false,
      shifts: [],
      message: `Failed to list rota shifts: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Create or update rota.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function createOrUpdateRota(
  tenantId: string,
  data: {
    practiceId: string;
    weekStart: Date;
    weekEnd: Date;
    shifts?: Array<{
      date: Date;
      startTime: Date;
      endTime: Date;
      role?: string;
    }>;
  },
  actorId: string
): Promise<{ supported: boolean; rota: RotaInfo | null; message?: string }> {
  try {
    // Verify practice exists and belongs to tenant
    const practice = await prisma.practice.findFirst({
      where: {
        id: data.practiceId,
        tenantId,
      },
    });

    if (!practice) {
      return {
        supported: false,
        rota: null,
        message: "Practice not found",
      };
    }

    // Check if rota already exists for this practice and week
    const existing = await prisma.healthcareRotaHeader.findFirst({
      where: {
        tenantId,
        practiceId: data.practiceId,
        weekStart: { lte: data.weekEnd },
        weekEnd: { gte: data.weekStart },
      },
    });

    let rota;
    if (existing) {
      // Update existing rota
      rota = await prisma.healthcareRotaHeader.update({
        where: { id: existing.id },
        data: {
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
        },
      });

      // Delete existing shifts if new shifts provided
      if (data.shifts) {
        await prisma.healthcareRotaShift.deleteMany({
          where: { headerId: rota.id },
        });
      }
    } else {
      // Create new rota
      rota = await prisma.healthcareRotaHeader.create({
        data: {
          tenantId,
          practiceId: data.practiceId,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
        },
      });
    }

    // Create shifts if provided
    if (data.shifts && data.shifts.length > 0) {
      await prisma.healthcareRotaShift.createMany({
        data: data.shifts.map((s) => ({
          headerId: rota.id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          role: s.role,
        })),
      });
    }

    // Reload with practice and shift count
    const rotaWithDetails = await prisma.healthcareRotaHeader.findUnique({
      where: { id: rota.id },
      include: {
        practice: {
          select: {
            name: true,
          },
        },
        shifts: {
          select: {
            id: true,
          },
        },
      },
    });

    // Audit log
    try {
      await auditEvent("healthcare.rota.created", {
        tenantId,
        rotaId: rota.id,
        practiceId: data.practiceId,
        actorId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      rota: {
        id: rota.id,
        practiceId: rota.practiceId,
        practiceName: rotaWithDetails?.practice.name,
        weekStart: rota.weekStart,
        weekEnd: rota.weekEnd,
        shiftCount: rotaWithDetails?.shifts.length || 0,
        createdAt: rota.createdAt,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      rota: null,
      message: `Failed to create/update rota: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Generate payroll input from rota (bridge only; does not mutate payroll).
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function generatePayrollInputFromRota(
  tenantId: string,
  period: string // YYYY-MM
): Promise<{
  supported: boolean;
  period: string;
  shifts: Array<{
    employeeId: string;
    employeeName: string;
    date: Date;
    hours: number;
    role?: string;
    practiceId: string;
    practiceName: string;
  }>;
  message?: string;
}> {
  try {
    // Parse period (YYYY-MM)
    const [year, month] = period.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return {
        supported: false,
        period,
        shifts: [],
        message: `Invalid period format. Expected YYYY-MM, got: ${period}`,
      };
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get rotas for this period
    const rotas = await prisma.healthcareRotaHeader.findMany({
      where: {
        tenantId,
        weekStart: { lte: periodEnd },
        weekEnd: { gte: periodStart },
      },
      include: {
        practice: {
          select: {
            id: true,
            name: true,
          },
        },
        shifts: {
          where: {
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          include: {
            assignments: {
              include: {
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const shifts: Array<{
      employeeId: string;
      employeeName: string;
      date: Date;
      hours: number;
      role?: string;
      practiceId: string;
      practiceName: string;
    }> = [];

    for (const rota of rotas) {
      for (const shift of rota.shifts) {
        for (const assignment of shift.assignments) {
          // Calculate hours
          const start = new Date(shift.startTime);
          const end = new Date(shift.endTime);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          shifts.push({
            employeeId: assignment.employeeId,
            employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
            date: shift.date,
            hours,
            role: shift.role || undefined,
            practiceId: rota.practiceId,
            practiceName: rota.practice.name,
          });
        }
      }
    }

    return {
      supported: true,
      period,
      shifts,
    };
  } catch (e: any) {
    return {
      supported: false,
      period,
      shifts: [],
      message: `Failed to generate payroll input from rota: ${e?.message || "unknown"}`,
    };
  }
}
