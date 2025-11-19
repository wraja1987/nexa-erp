import { assertLegalEntityAccess } from "@/lib/finance/entity";

export type TimesheetInput = { employeeId: string; projectId?: string; date: Date; hours: number; notes?: string };

export async function listTimesheets(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  // Schema gap: no Timesheet models present
  return [];
}

export async function createTimesheetEntry(_scope: { tenantId: string; entityId?: string | null }, _data: TimesheetInput) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}

export async function approveTimesheet(_scope: { tenantId: string; entityId?: string | null }, _id: string) {
  throw Object.assign(new Error("not_supported"), { code: 501 });
}


