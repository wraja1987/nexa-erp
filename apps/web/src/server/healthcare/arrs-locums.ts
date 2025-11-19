/**
 * Phase 14 — ARRS + Locums Bridge
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";

export type HealthcareStaffMember = {
  employeeId: string;
  empNo: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  department?: string;
  isArrsEligible?: boolean;
  arrsRoleId?: string;
  arrsRoleName?: string;
};

export type HealthcareStaffResult = {
  supported: boolean;
  staff: HealthcareStaffMember[];
  message?: string;
};

export type ArrsCostSummary = {
  supported: boolean;
  period: string; // YYYY-MM
  totalCost: number;
  currency: string;
  breakdown: Array<{
    employeeId: string;
    empNo: string;
    name: string;
    roleId?: string;
    roleName?: string;
    grossPay: number;
    netPay: number;
  }>;
  breakdownByRole?: Array<{
    roleId: string;
    roleName: string;
    employeeCount: number;
    totalCost: number;
  }>;
  message?: string;
};

/**
 * List healthcare staff.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listHealthcareStaff(tenantId: string, filters?: { practiceId?: string }): Promise<HealthcareStaffResult> {
  try {
    // Get all employees
    const employees = await prisma.employee.findMany({
      where: { tenantId },
      select: {
        id: true,
        empNo: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { lastName: "asc" },
    });

    // Get ARRS assignments for these employees
    const employeeIds = employees.map((e) => e.id);
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const arrsMap = new Map(arrsAssignments.map((a) => [a.employeeId, a]));

    // Filter by practice if needed (via LocumAssignment)
    let filteredEmployeeIds = employeeIds;
    if (filters?.practiceId) {
      const locumAssignments = await prisma.locumAssignment.findMany({
        where: {
          tenantId,
          practiceId: filters.practiceId,
          employeeId: { in: employeeIds },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
        select: {
          employeeId: true,
        },
      });
      filteredEmployeeIds = locumAssignments.map((l) => l.employeeId);
    }

    const staff: HealthcareStaffMember[] = employees
      .filter((e) => filteredEmployeeIds.includes(e.id))
      .map((e) => {
        const arrs = arrsMap.get(e.id);
        return {
          employeeId: e.id,
          empNo: e.empNo,
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email || undefined,
          isArrsEligible: !!arrs,
          arrsRoleId: arrs?.roleId,
          arrsRoleName: arrs?.role.name,
        };
      });

    return {
      supported: true,
      staff,
    };
  } catch (e: any) {
    return {
      supported: false,
      staff: [],
      message: `Failed to list healthcare staff: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get ARRS eligible staff.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getArrsEligibleStaff(tenantId: string): Promise<HealthcareStaffResult> {
  try {
    // Get active ARRS assignments
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Get employees for these assignments
    const employeeIds = arrsAssignments.map((a) => a.employeeId);
    const employees = await prisma.employee.findMany({
      where: {
        tenantId,
        id: { in: employeeIds },
      },
      select: {
        id: true,
        empNo: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const arrsMap = new Map(arrsAssignments.map((a) => [a.employeeId, a]));

    const staff: HealthcareStaffMember[] = employees.map((e) => {
      const arrs = arrsMap.get(e.id);
      return {
        employeeId: e.id,
        empNo: e.empNo,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email || undefined,
        isArrsEligible: true,
        arrsRoleId: arrs?.roleId,
        arrsRoleName: arrs?.role.name,
      };
    });

    return {
      supported: true,
      staff,
    };
  } catch (e: any) {
    return {
      supported: false,
      staff: [],
      message: `Failed to get ARRS eligible staff: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Build ARRS cost summary for a period.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function buildArrsCostSummary(
  tenantId: string,
  period: string // YYYY-MM
): Promise<ArrsCostSummary> {
  try {
    // Parse period (YYYY-MM)
    const [year, month] = period.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return {
        supported: false,
        period,
        totalCost: 0,
        currency: "GBP",
        breakdown: [],
        message: `Invalid period format. Expected YYYY-MM, got: ${period}`,
      };
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get active ARRS assignments for this period
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const arrsEmployeeIds = arrsAssignments.map((a) => a.employeeId);
    if (arrsEmployeeIds.length === 0) {
      return {
        supported: true,
        period,
        totalCost: 0,
        currency: "GBP",
        breakdown: [],
        breakdownByRole: [],
      };
    }

    // Get payroll runs for this period
    const runs = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
        status: "posted",
      },
      include: {
        Payslip: {
          where: {
            employeeId: { in: arrsEmployeeIds },
          },
          include: {
            employee: {
              select: {
                id: true,
                empNo: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Aggregate payslip data by employee and role
    const breakdownMap = new Map<string, { employeeId: string; empNo: string; name: string; roleId?: string; roleName?: string; grossPay: number; netPay: number }>();
    const roleMap = new Map<string, { roleName: string; employeeIds: Set<string>; totalCost: number }>();

    for (const run of runs) {
      for (const payslip of run.Payslip) {
        const arrs = arrsAssignments.find((a) => a.employeeId === payslip.employeeId);
        const roleId = arrs?.roleId || "unknown";
        const roleName = arrs?.role.name || "Unknown";

        const key = payslip.employeeId;
        const existing = breakdownMap.get(key);
        if (existing) {
          existing.grossPay += Number(payslip.grossPay);
          existing.netPay += Number(payslip.netPay);
        } else {
          breakdownMap.set(key, {
            employeeId: payslip.employeeId,
            empNo: payslip.employee.empNo,
            name: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
            roleId,
            roleName,
            grossPay: Number(payslip.grossPay),
            netPay: Number(payslip.netPay),
          });
        }

        // Aggregate by role
        const roleData = roleMap.get(roleId);
        if (roleData) {
          roleData.employeeIds.add(payslip.employeeId);
          roleData.totalCost += Number(payslip.grossPay);
        } else {
          roleMap.set(roleId, {
            roleName,
            employeeIds: new Set([payslip.employeeId]),
            totalCost: Number(payslip.grossPay),
          });
        }
      }
    }

    const breakdown = Array.from(breakdownMap.values());
    const breakdownByRole = Array.from(roleMap.entries()).map(([roleId, data]) => ({
      roleId,
      roleName: data.roleName,
      employeeCount: data.employeeIds.size,
      totalCost: data.totalCost,
    }));

    const totalCost = breakdown.reduce((sum, b) => sum + b.grossPay, 0);

    return {
      supported: true,
      period,
      totalCost,
      currency: "GBP",
      breakdown,
      breakdownByRole,
    };
  } catch (e: any) {
    return {
      supported: false,
      period,
      totalCost: 0,
      currency: "GBP",
      breakdown: [],
      message: `Failed to build ARRS cost summary: ${e?.message || "unknown"}`,
    };
  }
}
