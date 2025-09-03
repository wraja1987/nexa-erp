import { Prisma, PrismaClient } from '@prisma/client'
import { computeAnnual } from '../../server/payroll/calculators'

const prisma = new PrismaClient()

export type RunPayload = {
  tenantId: string
  scheduleId: string
  periodStart: Date
  periodEnd: Date
}

export async function runPayrollJob(payload: RunPayload): Promise<{ runId: string }> {
  const { tenantId, scheduleId, periodStart, periodEnd } = payload
  // Ensure schedule exists (create adhoc if missing)
  const schedule = await prisma.paySchedule.upsert({
    where: { id: scheduleId },
    update: {},
    create: { id: scheduleId, tenantId, name: 'Adhoc', frequency: 'monthly' },
  })
  const run = await prisma.payrollRun.create({ data: { tenantId, scheduleId: schedule.id, periodStart, periodEnd } })
  const employees = await prisma.employee.findMany({ where: { tenantId } })

  for (const emp of employees) {
    // Simplified: treat base 30k unless extended model fields exist later
    const annual = computeAnnual({ grossAnnual: 30000 }) // £30,000.00 in pounds
    const gross = Math.round(annual.netAnnual + annual.payeTaxAnnual + annual.niEmployeeAnnual) // pounds
    const net = annual.netAnnual // pounds
    await prisma.payslip.create({
      data: {
        tenantId,
        runId: run.id,
        employeeId: emp.id,
        grossPay: new Prisma.Decimal(gross),
        netPay: new Prisma.Decimal(net),
      },
    })
  }

  return { runId: run.id }
}


