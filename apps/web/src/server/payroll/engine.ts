/**
 * Enhanced Payroll Engine v1
 * 
 * UK PAYE/NI/Pension calculations with proper employee contract support.
 * Works with extended Employee model (contract, NI category, pension scheme).
 */

import { prisma } from "@/lib/prisma";
import {
  computePAYE,
  computeNIEmployee,
  computeNIEmployer,
  computePension,
  computeStudentLoan,
  computeAnnual,
  type PayrollInputs,
  type PayrollOutputs,
} from "./calculators";

export interface EmployeePayrollData {
  employeeId: string;
  empNo: string;
  firstName: string;
  lastName: string;
  // Contract data (from EmploymentContract or Employee model)
  grossAnnual: number; // Annual gross salary in pounds
  taxCode?: string; // e.g., "1257L", "BR", "K123"
  niCategory?: string; // e.g., "A", "B", "C", "H", "J", "M", "Z"
  pensionOptOut?: boolean;
  pensionSchemeId?: string;
  pensionEmpRate?: number; // Override default employee rate
  pensionErRate?: number; // Override default employer rate
  studentLoan?: boolean;
  // Period-specific adjustments
  periodGross?: number; // Override for this period (e.g., bonus, overtime)
}

export interface PayrollCalculationResult {
  employeeId: string;
  empNo: string;
  name: string;
  periodGross: number; // Period gross pay
  annualGross: number; // Annualised gross
  payeTax: number;
  niEmployee: number;
  niEmployer: number;
  pensionEmployee: number;
  pensionEmployer: number;
  studentLoan: number;
  netPay: number;
  totalCost: number; // Gross + NI Employer + Pension Employer
}

/**
 * Calculate payroll for a single employee
 */
export function calculateEmployeePayroll(
  employee: EmployeePayrollData,
  periodDays: number,
  periodType: "monthly" | "weekly" | "fortnightly" = "monthly"
): PayrollCalculationResult {
  // Determine period gross
  const periodGross = employee.periodGross ?? calculatePeriodGross(
    employee.grossAnnual,
    periodDays,
    periodType
  );

  // Annualise for calculations (if period-specific gross provided)
  const annualGross = employee.periodGross
    ? (employee.periodGross * getPeriodsPerYear(periodType))
    : employee.grossAnnual;

  // Calculate deductions
  const inputs: PayrollInputs = {
    grossAnnual: annualGross,
    taxCode: employee.taxCode || "1257L",
    niCategory: (employee.niCategory as any) || "A",
    pensionOptOut: employee.pensionOptOut || false,
    studentLoan: employee.studentLoan || false,
  };

  const annual = computeAnnual(inputs);

  // Scale to period (pro-rata)
  const periodMultiplier = periodGross / annualGross;
  const payeTax = Math.round(annual.payeTaxAnnual * periodMultiplier);
  const niEmployee = Math.round(annual.niEmployeeAnnual * periodMultiplier);
  const niEmployer = Math.round(annual.niEmployerAnnual * periodMultiplier);
  const pensionEmployee = employee.pensionOptOut
    ? 0
    : Math.round(
        (employee.pensionEmpRate
          ? periodGross * employee.pensionEmpRate
          : annual.pensionEmployeeAnnual * periodMultiplier)
      );
  const pensionEmployer = employee.pensionOptOut
    ? 0
    : Math.round(
        (employee.pensionErRate
          ? periodGross * employee.pensionErRate
          : annual.pensionEmployerAnnual * periodMultiplier)
      );
  const studentLoan = Math.round(annual.studentLoanAnnual * periodMultiplier);
  const netPay = periodGross - payeTax - niEmployee - pensionEmployee - studentLoan;
  const totalCost = periodGross + niEmployer + pensionEmployer;

  return {
    employeeId: employee.employeeId,
    empNo: employee.empNo,
    name: `${employee.firstName} ${employee.lastName}`,
    periodGross: Math.round(periodGross * 100) / 100,
    annualGross: Math.round(annualGross * 100) / 100,
    payeTax: Math.round(payeTax * 100) / 100,
    niEmployee: Math.round(niEmployee * 100) / 100,
    niEmployer: Math.round(niEmployer * 100) / 100,
    pensionEmployee: Math.round(pensionEmployee * 100) / 100,
    pensionEmployer: Math.round(pensionEmployer * 100) / 100,
    studentLoan: Math.round(studentLoan * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Calculate period gross from annual salary
 */
function calculatePeriodGross(
  annualGross: number,
  periodDays: number,
  periodType: "monthly" | "weekly" | "fortnightly"
): number {
  if (periodType === "monthly") {
    // Average month: 365.25 / 12 = 30.4375 days
    return (annualGross / 12);
  } else if (periodType === "weekly") {
    return (annualGross / 52);
  } else if (periodType === "fortnightly") {
    return (annualGross / 26);
  }
  return annualGross / 12; // Default monthly
}

function getPeriodsPerYear(periodType: "monthly" | "weekly" | "fortnightly"): number {
  if (periodType === "monthly") return 12;
  if (periodType === "weekly") return 52;
  if (periodType === "fortnightly") return 26;
  return 12;
}

/**
 * Load employee payroll data from database
 * Falls back to defaults if extended fields not available
 */
export async function loadEmployeePayrollData(
  tenantId: string,
  employeeId: string
): Promise<EmployeePayrollData> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId },
  });

  if (!employee) {
    throw new Error(`Employee ${employeeId} not found`);
  }

  // Try to load contract data (if EmploymentContract model exists)
  // For now, use defaults - will be enhanced when schema extended
  const contract = await (prisma as any).employmentContract?.findFirst({
    where: {
      employeeId: employee.id,
      tenantId,
      status: "active",
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
    orderBy: { startDate: "desc" },
  }).catch(() => null);

  // Try to load pension scheme (if PensionScheme model exists)
  const pensionScheme = contract?.pensionSchemeId
    ? await (prisma as any).pensionScheme?.findFirst({
        where: { id: contract.pensionSchemeId, tenantId },
      }).catch(() => null)
    : null;

  return {
    employeeId: employee.id,
    empNo: employee.empNo,
    firstName: employee.firstName,
    lastName: employee.lastName,
    grossAnnual: contract?.baseAnnual || contract?.baseMinor
      ? Number(contract.baseMinor || contract.baseAnnual) / 100
      : 30000, // Default £30k
    taxCode: contract?.taxCode || (employee as any).taxCode || "1257L",
    niCategory: contract?.niCategory || (employee as any).niCategory || "A",
    pensionOptOut: contract?.pensionOptOut || (employee as any).pensionOptOut || false,
    pensionSchemeId: contract?.pensionSchemeId || (employee as any).pensionSchemeId || undefined,
    pensionEmpRate: pensionScheme?.employeeRate
      ? Number(pensionScheme.employeeRate)
      : undefined,
    pensionErRate: pensionScheme?.employerRate
      ? Number(pensionScheme.employerRate)
      : undefined,
    studentLoan: contract?.studentLoan || (employee as any).studentLoan || false,
  };
}

/**
 * Calculate payroll for all employees in a run
 */
export async function calculatePayrollRun(
  tenantId: string,
  runId: string
): Promise<PayrollCalculationResult[]> {
  const run = await prisma.payrollRun.findFirst({
    where: { id: runId, tenantId },
    include: { schedule: true },
  });

  if (!run) {
    throw new Error(`Payroll run ${runId} not found`);
  }

  const employees = await prisma.employee.findMany({
    where: { tenantId },
  });

  const periodDays = Math.ceil(
    (run.periodEnd.getTime() - run.periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const periodType = run.schedule.frequency === "weekly"
    ? "weekly"
    : run.schedule.frequency === "fortnightly"
    ? "fortnightly"
    : "monthly";

  const results: PayrollCalculationResult[] = [];

  for (const emp of employees) {
    try {
      const empData = await loadEmployeePayrollData(tenantId, emp.id);
      const calc = calculateEmployeePayroll(empData, periodDays, periodType);
      results.push(calc);
    } catch (error: any) {
      console.error(`[Payroll] Failed to calculate for employee ${emp.id}:`, error);
      // Continue with other employees
    }
  }

  return results;
}

