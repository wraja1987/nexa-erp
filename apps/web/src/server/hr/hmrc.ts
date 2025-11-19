import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function buildHmrcSubmissionPayload(scope: { tenantId: string; entityId?: string | null }, runId: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, tenantId: scope.tenantId } });
  if (!run) throw Object.assign(new Error("not_found"), { code: 404 });
  // Performance: Explicit select to avoid fetching unnecessary fields
  const slips = await prisma.payslip.findMany({
    where: { tenantId: scope.tenantId, runId },
    select: {
      id: true,
      employeeId: true,
      grossPay: true,
      netPay: true,
      employee: {
        select: {
          empNo: true,
          firstName: true,
          lastName: true,
        },
      },
      Allowance: {
        select: {
          name: true,
          amount: true,
        },
      },
      Deduction: {
        select: {
          name: true,
          amount: true,
        },
      },
    },
  });
  return {
    run: {
      id: run.id,
      periodStart: run.periodStart.toISOString(),
      periodEnd: run.periodEnd.toISOString(),
      status: run.status,
    },
    payslips: slips.map((p) => ({
      employee: { id: p.employeeId, empNo: (p as any).employee?.empNo, name: `${(p as any).employee?.firstName} ${(p as any).employee?.lastName}`.trim() },
      gross: Number(p.grossPay || 0),
      net: Number(p.netPay || 0),
      allowances: (p as any).Allowance?.map((a: any) => ({ name: a.name, amount: Number(a.amount || 0) })) || [],
      deductions: (p as any).Deduction?.map((d: any) => ({ name: d.name, amount: Number(d.amount || 0) })) || [],
    })),
  };
}

export function exportHmrcFile(_scope: { tenantId: string }, payload: any) {
  // Return JSON payload as-is; real file formats are out of scope here
  return JSON.stringify(payload, null, 2);
}

/**
 * Enhanced HMRC RTI export using new RTI format
 */
export async function exportHmrcRtiFile(
  scope: { tenantId: string; entityId?: string | null },
  runId: string,
  format: "csv" | "json" = "csv"
): Promise<string> {
  const { buildRtiSubmission, exportRtiToCsv, exportRtiToJson } = await import("@/server/payroll/rti");
  const { calculatePayrollRun } = await import("@/server/payroll/engine");
  
  const calculations = await calculatePayrollRun(scope.tenantId, runId);
  const submission = await buildRtiSubmission(scope.tenantId, runId, calculations);
  
  if (format === "json") {
    return exportRtiToJson(submission);
  }
  return exportRtiToCsv(submission);
}


