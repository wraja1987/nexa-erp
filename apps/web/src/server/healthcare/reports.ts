/**
 * Phase 14 — Healthcare Reporting
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";

export type HealthcareOverview = {
  supported: boolean;
  period: string; // YYYY-MM
  practiceCount: number;
  pcnCount: number;
  totalStaff: number;
  totalRotaShifts: number;
  totalStaffCost: number;
  arrsCost?: number;
  currency: string;
  kpis: {
    shiftsPerPractice?: number;
    staffPerPractice?: number;
    arrsStaffCount?: number;
    arrsCostPercentage?: number;
  };
  message?: string;
};

export type PracticeReport = {
  supported: boolean;
  practiceId: string;
  practiceName?: string;
  period: string; // YYYY-MM
  staffCount: number;
  rotaCoverage: number;
  staffCost: number;
  arrsCost?: number;
  claimsSubmitted: number;
  claimsAmount: number;
  currency: string;
  message?: string;
};

export type PcnReport = {
  supported: boolean;
  pcnId: string;
  pcnName?: string;
  period: string; // YYYY-MM
  practiceCount: number;
  totalStaff: number;
  totalCost: number;
  arrsCost?: number;
  claimsSubmitted: number;
  claimsAmount: number;
  currency: string;
  message?: string;
};

/**
 * Get healthcare overview for a period.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getHealthcareOverview(tenantId: string, period: string): Promise<HealthcareOverview> {
  try {
    // Parse period (YYYY-MM)
    const [year, month] = period.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return {
        supported: false,
        period,
        practiceCount: 0,
        pcnCount: 0,
        totalStaff: 0,
        totalRotaShifts: 0,
        totalStaffCost: 0,
        currency: "GBP",
        kpis: {},
        message: `Invalid period format. Expected YYYY-MM, got: ${period}`,
      };
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Count practices
    const practiceCount = await prisma.practice.count({
      where: { tenantId },
    });

    // Count PCNs
    const pcnCount = await prisma.pcn.count({
      where: { tenantId },
    });

    // Count employees
    const totalStaff = await prisma.employee.count({
      where: { tenantId },
    });

    // Count rota shifts for this period
    const rotas = await prisma.healthcareRotaHeader.findMany({
      where: {
        tenantId,
        weekStart: { lte: periodEnd },
        weekEnd: { gte: periodStart },
      },
      include: {
        shifts: {
          where: {
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
      },
    });

    const totalRotaShifts = rotas.reduce((sum, r) => sum + r.shifts.length, 0);

    // Get payroll costs for period
    const runs = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
        status: "posted",
      },
      include: {
        Payslip: true,
      },
    });

    const totalStaffCost = runs.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    // Get ARRS cost
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
    });

    const arrsEmployeeIds = arrsAssignments.map((a) => a.employeeId);
    const arrsRuns = await prisma.payrollRun.findMany({
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
        },
      },
    });

    const arrsCost = arrsRuns.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    const arrsStaffCount = arrsEmployeeIds.length;

    return {
      supported: true,
      period,
      practiceCount,
      pcnCount,
      totalStaff,
      totalRotaShifts,
      totalStaffCost,
      arrsCost,
      currency: "GBP",
      kpis: {
        shiftsPerPractice: practiceCount > 0 ? totalRotaShifts / practiceCount : 0,
        staffPerPractice: practiceCount > 0 ? totalStaff / practiceCount : 0,
        arrsStaffCount,
        arrsCostPercentage: totalStaffCost > 0 ? (arrsCost / totalStaffCost) * 100 : 0,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      period,
      practiceCount: 0,
      pcnCount: 0,
      totalStaff: 0,
      totalRotaShifts: 0,
      totalStaffCost: 0,
      currency: "GBP",
      kpis: {},
      message: `Failed to build healthcare overview: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get practice report.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getPracticeReport(
  tenantId: string,
  practiceId: string,
  period: string
): Promise<PracticeReport> {
  try {
    // Parse period (YYYY-MM)
    const [year, month] = period.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return {
        supported: false,
        practiceId,
        period,
        staffCount: 0,
        rotaCoverage: 0,
        staffCost: 0,
        claimsSubmitted: 0,
        claimsAmount: 0,
        currency: "GBP",
        message: `Invalid period format. Expected YYYY-MM, got: ${period}`,
      };
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get practice
    const practice = await prisma.practice.findFirst({
      where: {
        id: practiceId,
        tenantId,
      },
    });

    if (!practice) {
      return {
        supported: false,
        practiceId,
        period,
        staffCount: 0,
        rotaCoverage: 0,
        staffCost: 0,
        claimsSubmitted: 0,
        claimsAmount: 0,
        currency: "GBP",
        message: "Practice not found",
      };
    }

    // Count staff assigned to this practice (via LocumAssignment or rota assignments)
    const locumAssignments = await prisma.locumAssignment.findMany({
      where: {
        tenantId,
        practiceId,
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
      select: {
        employeeId: true,
      },
    });

    const rotaAssignments = await prisma.healthcareRotaAssignment.findMany({
      where: {
        shift: {
          header: {
            tenantId,
            practiceId,
            weekStart: { lte: periodEnd },
            weekEnd: { gte: periodStart },
          },
        },
      },
      select: {
        employeeId: true,
      },
    });

    const uniqueStaffIds = new Set([
      ...locumAssignments.map((l) => l.employeeId),
      ...rotaAssignments.map((r) => r.employeeId),
    ]);

    const staffCount = uniqueStaffIds.size;

    // Get rota shifts for this practice and period
    const rotas = await prisma.healthcareRotaHeader.findMany({
      where: {
        tenantId,
        practiceId,
        weekStart: { lte: periodEnd },
        weekEnd: { gte: periodStart },
      },
      include: {
        shifts: {
          where: {
            date: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        },
      },
    });

    const rotaCoverage = rotas.reduce((sum, r) => sum + r.shifts.length, 0);

    // Get payroll costs for staff assigned to this practice
    const employeeIds = Array.from(uniqueStaffIds);
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
            employeeId: { in: employeeIds },
          },
        },
      },
    });

    const staffCost = runs.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    // Get ARRS cost for this practice
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
    });

    const arrsEmployeeIds = arrsAssignments.map((a) => a.employeeId);
    const arrsRuns = await prisma.payrollRun.findMany({
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
        },
      },
    });

    const arrsCost = arrsRuns.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    // Get claims for this practice and period
    const claims = await prisma.healthcareClaim.findMany({
      where: {
        tenantId,
        practiceId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
        status: { not: "draft" },
      },
    });

    const claimsSubmitted = claims.length;
    const claimsAmount = claims.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      supported: true,
      practiceId,
      practiceName: practice.name,
      period,
      staffCount,
      rotaCoverage,
      staffCost,
      arrsCost,
      claimsSubmitted,
      claimsAmount,
      currency: "GBP",
    };
  } catch (e: any) {
    return {
      supported: false,
      practiceId,
      period,
      staffCount: 0,
      rotaCoverage: 0,
      staffCost: 0,
      claimsSubmitted: 0,
      claimsAmount: 0,
      currency: "GBP",
      message: `Failed to build practice report: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get PCN report.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getPcnReport(tenantId: string, pcnId: string, period: string): Promise<PcnReport> {
  try {
    // Parse period (YYYY-MM)
    const [year, month] = period.split("-").map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return {
        supported: false,
        pcnId,
        period,
        practiceCount: 0,
        totalStaff: 0,
        totalCost: 0,
        claimsSubmitted: 0,
        claimsAmount: 0,
        currency: "GBP",
        message: `Invalid period format. Expected YYYY-MM, got: ${period}`,
      };
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    // Get PCN
    const pcn = await prisma.pcn.findFirst({
      where: {
        id: pcnId,
        tenantId,
      },
      include: {
        practices: {
          select: {
            practiceId: true,
          },
        },
      },
    });

    if (!pcn) {
      return {
        supported: false,
        pcnId,
        period,
        practiceCount: 0,
        totalStaff: 0,
        totalCost: 0,
        claimsSubmitted: 0,
        claimsAmount: 0,
        currency: "GBP",
        message: "PCN not found",
      };
    }

    const practiceIds = pcn.practices.map((p) => p.practiceId);
    const practiceCount = practiceIds.length;

    // Get staff across all practices in PCN
    const locumAssignments = await prisma.locumAssignment.findMany({
      where: {
        tenantId,
        practiceId: { in: practiceIds },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
      select: {
        employeeId: true,
      },
    });

    const rotaAssignments = await prisma.healthcareRotaAssignment.findMany({
      where: {
        shift: {
          header: {
            tenantId,
            practiceId: { in: practiceIds },
            weekStart: { lte: periodEnd },
            weekEnd: { gte: periodStart },
          },
        },
      },
      select: {
        employeeId: true,
      },
    });

    const uniqueStaffIds = new Set([
      ...locumAssignments.map((l) => l.employeeId),
      ...rotaAssignments.map((r) => r.employeeId),
    ]);

    const totalStaff = uniqueStaffIds.size;

    // Get payroll costs
    const employeeIds = Array.from(uniqueStaffIds);
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
            employeeId: { in: employeeIds },
          },
        },
      },
    });

    const totalCost = runs.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    // Get ARRS cost
    const arrsAssignments = await prisma.arrsAssignment.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        startDate: { lte: periodEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: periodStart } },
        ],
      },
    });

    const arrsEmployeeIds = arrsAssignments.map((a) => a.employeeId);
    const arrsRuns = await prisma.payrollRun.findMany({
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
        },
      },
    });

    const arrsCost = arrsRuns.reduce((sum, run) => {
      return sum + run.Payslip.reduce((pSum, slip) => pSum + Number(slip.grossPay), 0);
    }, 0);

    // Get claims for this PCN
    const claims = await prisma.arrsClaim.findMany({
      where: {
        tenantId,
        pcnId,
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
        status: { not: "draft" },
      },
    });

    const claimsSubmitted = claims.length;
    const claimsAmount = claims.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      supported: true,
      pcnId,
      pcnName: pcn.name,
      period,
      practiceCount,
      totalStaff,
      totalCost,
      arrsCost,
      claimsSubmitted,
      claimsAmount,
      currency: "GBP",
    };
  } catch (e: any) {
    return {
      supported: false,
      pcnId,
      period,
      practiceCount: 0,
      totalStaff: 0,
      totalCost: 0,
      claimsSubmitted: 0,
      claimsAmount: 0,
      currency: "GBP",
      message: `Failed to build PCN report: ${e?.message || "unknown"}`,
    };
  }
}
