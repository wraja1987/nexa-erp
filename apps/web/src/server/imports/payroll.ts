/**
 * Payroll Import Service
 */

import { prisma } from "@/lib/prisma";
import { parseCsv, mapCsvToRows, parseNumber, parseDate } from "./parser";
import { validatePayrollRows } from "./validation";
import { auditEvent } from "@/lib/observability/audit";
import type { PayrollRow, ImportValidationError } from "./schema";
import type { TenantContext } from "./jobs";

export type PayrollPreviewResult = {
  supported: boolean;
  rows: PayrollRow[];
  errors: ImportValidationError[];
  message?: string;
};

export type PayrollApplyResult = {
  supported: boolean;
  applied: number;
  errors: ImportValidationError[];
  message?: string;
};

/**
 * Preview payroll import.
 */
export async function previewPayrollImport(
  tenantContext: TenantContext,
  csvContents: string
): Promise<PayrollPreviewResult> {
  try {
    const { rows: csvRows } = parseCsv(csvContents);

    // Map CSV to PayrollRow objects
    // Format: RunId,EmployeeNo,PeriodStart,PeriodEnd,GrossPay,NetPay
    const { rows, errors: parseErrors } = mapCsvToRows<PayrollRow>(csvRows, (row, rowNum) => {
      if (row.length < 6) {
        return {
          row: rowNum,
          message: "Row must have at least RunId,EmployeeNo,PeriodStart,PeriodEnd,GrossPay,NetPay columns",
        };
      }

      const runId = row[0]?.trim() || undefined;
      const employeeNo = row[1]?.trim() || "";
      const periodStart = row[2]?.trim() || "";
      const periodEnd = row[3]?.trim() || "";
      const grossPay = parseNumber(row[4] || "0");
      const netPay = parseNumber(row[5] || "0");

      if (!employeeNo || !periodStart || !periodEnd) {
        return {
          row: rowNum,
          message: "EmployeeNo, PeriodStart, and PeriodEnd are required",
        };
      }

      if (grossPay === null || netPay === null) {
        return {
          row: rowNum,
          message: "GrossPay and NetPay must be valid numbers",
        };
      }

      return {
        originalRowNumber: rowNum,
        runId,
        employeeNo,
        periodStart,
        periodEnd,
        grossPay,
        netPay,
      };
    });

    // Validate rows
    const validation = await validatePayrollRows(tenantContext, rows);

    return {
      supported: validation.supported,
      rows: validation.valid,
      errors: [...parseErrors, ...validation.errors],
      message: validation.message,
    };
  } catch (e: any) {
    return {
      supported: false,
      rows: [],
      errors: [],
      message: `Failed to preview payroll import: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Apply payroll import.
 * Creates PayrollRun and Payslip records in draft/calculated status.
 */
export async function applyPayrollImport(tenantContext: TenantContext, rows: PayrollRow[]): Promise<PayrollApplyResult> {
  const validation = await validatePayrollRows(tenantContext, rows);
  if (!validation.supported) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: validation.message,
    };
  }

  try {
    let applied = 0;
    const errors: ImportValidationError[] = [];

    // Get employees
    const employees = await (prisma as any).employee.findMany({
      where: { tenantId: tenantContext.tenantId },
      select: { id: true, empNo: true },
    });
    const empNoToId = new Map(employees.map((e: any) => [e.empNo, e.id]));

    // Get or create pay schedule
    let schedule = await (prisma as any).paySchedule.findFirst({
      where: { tenantId: tenantContext.tenantId },
    });

    if (!schedule) {
      schedule = await (prisma as any).paySchedule.create({
        data: {
          tenantId: tenantContext.tenantId,
          name: "Default",
          frequency: "monthly",
        },
      });
    }

    // Group rows by runId (or create one run per row if no runId)
    const runMap = new Map<string, PayrollRow[]>();

    for (const row of validation.valid) {
      const runKey = row.runId || `run-${row.periodStart}-${row.periodEnd}`;
      if (!runMap.has(runKey)) {
        runMap.set(runKey, []);
      }
      runMap.get(runKey)!.push(row);
    }

    for (const [runKey, runRows] of runMap.entries()) {
      try {
        const firstRow = runRows[0];
        const periodStart = new Date(firstRow.periodStart);
        const periodEnd = new Date(firstRow.periodEnd);

        // Create payroll run
        const run = await (prisma as any).payrollRun.create({
          data: {
            tenantId: tenantContext.tenantId,
            scheduleId: schedule.id,
            periodStart,
            periodEnd,
            status: "calculated" as any, // Draft/calculated status
          },
        });

        // Create payslips for each employee in this run
        for (const row of runRows) {
          const employeeId = empNoToId.get(row.employeeNo);
          if (!employeeId) {
            errors.push({
              row: row.originalRowNumber,
              message: `Employee ${row.employeeNo} not found`,
            });
            continue;
          }

          await (prisma as any).payslip.create({
            data: {
              tenantId: tenantContext.tenantId,
              runId: run.id,
              employeeId,
              grossPay: row.grossPay as any,
              netPay: row.netPay as any,
            },
          });

          applied++;
        }
      } catch (e: any) {
        errors.push({
          row: runRows[0].originalRowNumber,
          message: `Failed to create payroll run: ${e?.message || "unknown"}`,
        });
      }
    }

    await auditEvent("IMPORT_APPLIED", {
      tenantId: tenantContext.tenantId,
      actorId: tenantContext.userId,
      target: "payroll",
      type: "payroll",
      rowsProcessed: rows.length,
      rowsSucceeded: applied,
      rowsFailed: errors.length,
    });

    return {
      supported: true,
      applied,
      errors,
    };
  } catch (e: any) {
    return {
      supported: false,
      applied: 0,
      errors: [],
      message: `Failed to apply payroll import: ${e?.message || "unknown"}`,
    };
  }
}

