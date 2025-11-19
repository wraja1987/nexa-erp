import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { HrPayrollRunCommitted } from "@/server/events/types";

export async function listPayrollRuns(
  scope: { tenantId: string; entityId?: string | null },
  opts?: { limit?: number; offset?: number }
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Performance: Pagination defaults (limit 50, max 500)
  const limit = Math.min(opts?.limit || 50, 500);
  const offset = opts?.offset || 0;

  return prisma.payrollRun.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    // Performance: Explicit select
    select: {
      id: true,
      tenantId: true,
      scheduleId: true,
      periodStart: true,
      periodEnd: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function buildPayRun(scope: { tenantId: string; entityId?: string | null }, params: { periodStart: Date; periodEnd: Date; scheduleId?: string }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const schedule = params.scheduleId
    ? await prisma.paySchedule.findFirst({ where: { id: params.scheduleId, tenantId: scope.tenantId } })
    : await prisma.paySchedule.findFirst({ where: { tenantId: scope.tenantId } });
  if (!schedule) {
    // create a default schedule if not exists
    await prisma.paySchedule.create({ data: { tenantId: scope.tenantId, name: "Default", frequency: "monthly" } });
  }
  const sch = schedule || (await prisma.paySchedule.findFirst({ where: { tenantId: scope.tenantId } }));
  const run = await prisma.payrollRun.create({
    data: {
      tenantId: scope.tenantId,
      scheduleId: sch!.id,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      status: "draft" as any, // Start as draft, will be calculated
    },
  });
  
  // Use enhanced payroll engine to calculate payslips
  try {
    const { calculatePayrollRun } = await import("@/server/payroll/engine");
    const calculations = await calculatePayrollRun(scope.tenantId, run.id);
    
    // Create payslips with calculated values
    for (const calc of calculations) {
      const payslip = await prisma.payslip.create({
        data: {
          tenantId: scope.tenantId,
          runId: run.id,
          employeeId: calc.employeeId,
          grossPay: calc.periodGross as any,
          netPay: calc.netPay as any,
        },
      });
      
      // Store detailed breakdown in Allowance/Deduction records
      if (calc.payeTax > 0) {
        await prisma.deduction.create({
          data: {
            tenantId: scope.tenantId,
            payslipId: payslip.id,
            name: "PAYE Tax",
            amount: calc.payeTax as any,
          },
        });
      }
      if (calc.niEmployee > 0) {
        await prisma.deduction.create({
          data: {
            tenantId: scope.tenantId,
            payslipId: payslip.id,
            name: "NI Employee",
            amount: calc.niEmployee as any,
          },
        });
      }
      if (calc.pensionEmployee > 0) {
        await prisma.deduction.create({
          data: {
            tenantId: scope.tenantId,
            payslipId: payslip.id,
            name: "Pension Employee",
            amount: calc.pensionEmployee as any,
          },
        });
      }
      if (calc.studentLoan > 0) {
        await prisma.deduction.create({
          data: {
            tenantId: scope.tenantId,
            payslipId: payslip.id,
            name: "Student Loan",
            amount: calc.studentLoan as any,
          },
        });
      }
    }
    
    // Update run status to calculated
    await prisma.payrollRun.update({
      where: { id: run.id },
      data: { status: "calculated" as any },
    });
  } catch (error: any) {
    // Fallback to basic payslips if enhanced engine fails
    console.warn(`[Payroll] Enhanced calculation failed, using basic mode:`, error);
    const employees = await prisma.employee.findMany({ where: { tenantId: scope.tenantId } });
    for (const emp of employees) {
      await prisma.payslip.create({
        data: {
          tenantId: scope.tenantId,
          runId: run.id,
          employeeId: emp.id,
          grossPay: 0 as any,
          netPay: 0 as any,
        },
      });
    }
  }
  
  return run;
}

export async function commitPayRun(scope: { tenantId: string; entityId?: string | null }, runId: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const run = await prisma.payrollRun.findFirst({ where: { id: runId, tenantId: scope.tenantId }, include: { Payslip: true } });
  if (!run) throw Object.assign(new Error("not_found"), { code: 404 });
  const updated = await prisma.payrollRun.update({ where: { id: run.id }, data: { status: "posted" as any } });

  // Publish event (after update completes)
  try {
    const slips = (run as any).Payslip || [];
    const totalGross = slips.reduce((sum: number, slip: any) => sum + Number(slip.grossPay || 0), 0);
    const event: HrPayrollRunCommitted = {
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "hr.payroll.run.committed",
      occurredAt: nowIso(),
      source: "hr.payroll",
      version: 1,
      payload: {
        runId: updated.id,
        periodStart: updated.periodStart.toISOString(),
        periodEnd: updated.periodEnd.toISOString(),
        employeeCount: slips.length,
        totalGrossPayMinor: totalGross * 100,
        committedAt: nowIso(),
      },
    };
    await publishWithOutbox(event);
  } catch (error) {
    console.warn(`[HR] Failed to publish payroll.run.committed event:`, error);
  }

  return updated;
}


