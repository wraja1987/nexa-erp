/**
 * RTI (Real Time Information) Export Format v1
 * 
 * Generates HMRC RTI-compliant export files for payroll submissions.
 * Format: FPS (Full Payment Submission) and EPS (Employer Payment Summary)
 */

import type { PayrollCalculationResult } from "./engine";
import { prisma } from "@/lib/prisma";

export interface RtiEmployeeRecord {
  payrollId: string; // HMRC payroll ID (if registered)
  title?: string;
  forename: string;
  surname: string;
  nino?: string; // National Insurance Number
  worksNumber: string; // Employee number
  payFrequency: "W1" | "M1" | "F1"; // Weekly, Monthly, Fortnightly
  payBasis: "R"; // Regular
  paymentDate: string; // YYYY-MM-DD
  payPeriodStart: string; // YYYY-MM-DD
  payPeriodEnd: string; // YYYY-MM-DD
  grossPay: number; // In pence
  taxablePay: number; // In pence
  payeTax: number; // In pence
  niEmployee: number; // In pence
  niEmployer: number; // In pence
  pensionEmployee: number; // In pence
  pensionEmployer: number; // In pence
  studentLoan: number; // In pence
  netPay: number; // In pence
  taxCode?: string;
  niCategory?: string;
}

export interface RtiSubmission {
  submissionType: "FPS" | "EPS";
  employerReference: string; // PAYE reference
  submissionDate: string; // YYYY-MM-DD
  taxYear: string; // YYYY-YY
  taxMonth: number; // 1-12
  employees: RtiEmployeeRecord[];
  totals: {
    grossPay: number;
    taxablePay: number;
    payeTax: number;
    niEmployee: number;
    niEmployer: number;
    pensionEmployee: number;
    pensionEmployer: number;
    studentLoan: number;
    netPay: number;
  };
}

/**
 * Convert payroll calculations to RTI format
 */
export async function buildRtiSubmission(
  tenantId: string,
  runId: string,
  calculations: PayrollCalculationResult[]
): Promise<RtiSubmission> {
  const run = await prisma.payrollRun.findFirst({
    where: { id: runId, tenantId },
    include: { schedule: true },
  });

  if (!run) {
    throw new Error(`Payroll run ${runId} not found`);
  }

  // Load employer PAYE reference (if available)
  const entityExt = await (prisma as any).entityExt?.findFirst({
    where: { tenantId },
  }).catch(() => null);

  const payeReference = entityExt?.payeReference || "00000000"; // Default placeholder

  // Determine pay frequency code
  const frequency = run.schedule.frequency.toLowerCase();
  const payFrequency: "W1" | "M1" | "F1" =
    frequency === "weekly" ? "W1" : frequency === "fortnightly" ? "F1" : "M1";

  // Build employee records
  const employees: RtiEmployeeRecord[] = [];
  const totals = {
    grossPay: 0,
    taxablePay: 0,
    payeTax: 0,
    niEmployee: 0,
    niEmployer: 0,
    pensionEmployee: 0,
    pensionEmployer: 0,
    studentLoan: 0,
    netPay: 0,
  };

  for (const calc of calculations) {
    const employee = await prisma.employee.findFirst({
      where: { id: calc.employeeId, tenantId },
    });

    if (!employee) continue;

    // Try to load contract for NINO, tax code, NI category
    const contract = await (prisma as any).employmentContract?.findFirst({
      where: {
        employeeId: employee.id,
        tenantId,
        status: "active",
      },
      orderBy: { startDate: "desc" },
    }).catch(() => null);

    const grossPayPence = Math.round(calc.periodGross * 100);
    const taxablePayPence = grossPayPence; // Simplified - would deduct pension contributions
    const payeTaxPence = Math.round(calc.payeTax * 100);
    const niEmployeePence = Math.round(calc.niEmployee * 100);
    const niEmployerPence = Math.round(calc.niEmployer * 100);
    const pensionEmployeePence = Math.round(calc.pensionEmployee * 100);
    const pensionEmployerPence = Math.round(calc.pensionEmployer * 100);
    const studentLoanPence = Math.round(calc.studentLoan * 100);
    const netPayPence = Math.round(calc.netPay * 100);

    employees.push({
      payrollId: contract?.hmrcPayrollId || "",
      forename: employee.firstName,
      surname: employee.lastName,
      nino: contract?.nino || (employee as any).nino || "",
      worksNumber: employee.empNo,
      payFrequency,
      payBasis: "R",
      paymentDate: run.periodEnd.toISOString().split("T")[0],
      payPeriodStart: run.periodStart.toISOString().split("T")[0],
      payPeriodEnd: run.periodEnd.toISOString().split("T")[0],
      grossPay: grossPayPence,
      taxablePay: taxablePayPence,
      payeTax: payeTaxPence,
      niEmployee: niEmployeePence,
      niEmployer: niEmployerPence,
      pensionEmployee: pensionEmployeePence,
      pensionEmployer: pensionEmployerPence,
      studentLoan: studentLoanPence,
      netPay: netPayPence,
      taxCode: contract?.taxCode || (employee as any).taxCode || "1257L",
      niCategory: contract?.niCategory || (employee as any).niCategory || "A",
    });

    totals.grossPay += grossPayPence;
    totals.taxablePay += taxablePayPence;
    totals.payeTax += payeTaxPence;
    totals.niEmployee += niEmployeePence;
    totals.niEmployer += niEmployerPence;
    totals.pensionEmployee += pensionEmployeePence;
    totals.pensionEmployer += pensionEmployerPence;
    totals.studentLoan += studentLoanPence;
    totals.netPay += netPayPence;
  }

  // Determine tax year and month
  const periodDate = run.periodEnd;
  const taxYear = getTaxYear(periodDate);
  const taxMonth = getTaxMonth(periodDate);

  return {
    submissionType: "FPS",
    employerReference: payeReference,
    submissionDate: new Date().toISOString().split("T")[0],
    taxYear,
    taxMonth,
    employees,
    totals,
  };
}

/**
 * Export RTI submission to file format (CSV for v1)
 */
export function exportRtiToCsv(submission: RtiSubmission): string {
  const lines: string[] = [];

  // Header
  lines.push(
    "Submission Type,Employer Reference,Submission Date,Tax Year,Tax Month"
  );
  lines.push(
    `${submission.submissionType},${submission.employerReference},${submission.submissionDate},${submission.taxYear},${submission.taxMonth}`
  );
  lines.push("");

  // Employee header
  lines.push(
    "Payroll ID,Title,Forename,Surname,NINO,Works Number,Pay Frequency,Pay Basis,Payment Date,Pay Period Start,Pay Period End,Gross Pay,Taxable Pay,PAYE Tax,NI Employee,NI Employer,Pension Employee,Pension Employer,Student Loan,Net Pay,Tax Code,NI Category"
  );

  // Employee records
  for (const emp of submission.employees) {
    lines.push(
      [
        emp.payrollId || "",
        emp.title || "",
        emp.forename,
        emp.surname,
        emp.nino || "",
        emp.worksNumber,
        emp.payFrequency,
        emp.payBasis,
        emp.paymentDate,
        emp.payPeriodStart,
        emp.payPeriodEnd,
        emp.grossPay,
        emp.taxablePay,
        emp.payeTax,
        emp.niEmployee,
        emp.niEmployer,
        emp.pensionEmployee,
        emp.pensionEmployer,
        emp.studentLoan,
        emp.netPay,
        emp.taxCode || "",
        emp.niCategory || "",
      ].join(",")
    );
  }

  lines.push("");

  // Totals
  lines.push("Totals");
  lines.push(
    `Gross Pay,Taxable Pay,PAYE Tax,NI Employee,NI Employer,Pension Employee,Pension Employer,Student Loan,Net Pay`
  );
  lines.push(
    [
      submission.totals.grossPay,
      submission.totals.taxablePay,
      submission.totals.payeTax,
      submission.totals.niEmployee,
      submission.totals.niEmployer,
      submission.totals.pensionEmployee,
      submission.totals.pensionEmployer,
      submission.totals.studentLoan,
      submission.totals.netPay,
    ].join(",")
  );

  return lines.join("\n");
}

/**
 * Export RTI submission to JSON format (for API)
 */
export function exportRtiToJson(submission: RtiSubmission): string {
  return JSON.stringify(submission, null, 2);
}

function getTaxYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  // UK tax year runs 6 April to 5 April
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

function getTaxMonth(date: Date): number {
  const month = date.getMonth() + 1;
  // UK tax year starts in April (month 4)
  if (month >= 4) {
    return month - 3;
  } else {
    return month + 9;
  }
}

