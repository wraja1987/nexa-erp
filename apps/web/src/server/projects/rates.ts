/**
 * Phase 5A — Project Billing Rates
 * Depth Pass: Employee rate resolution for WIP calculations
 */

import { prisma } from "@/lib/prisma";

/**
 * Get billing rate for an employee
 * Phase 5A: Uses Employee model or falls back to configurable default
 */
export async function getEmployeeBillingRate(
  tenantId: string,
  employeeId: string
): Promise<number> {
  // Try to get rate from Employee (if rate field exists in future)
  // For now, use a configurable default via environment variable
  const defaultRate = process.env.NEXA_DEFAULT_BILLING_RATE
    ? parseFloat(process.env.NEXA_DEFAULT_BILLING_RATE)
    : 100; // Default: £100/hour

  // Future: If Employee model gets a billingRate field, use it:
  // const employee = await prisma.employee.findFirst({
  //   where: { id: employeeId, tenantId },
  //   select: { billingRate: true },
  // });
  // if (employee?.billingRate) {
  //   return Number(employee.billingRate);
  // }

  return defaultRate;
}

