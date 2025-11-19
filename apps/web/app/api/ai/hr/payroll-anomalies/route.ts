import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getPayrollAnomalies } from "@/server/ai/tasks/payrollAnomaly";

export async function GET() {
  await requirePermissionServer("ui:ai:payroll");
  const { tenantId } = await getSessionContext();
  const data = await getPayrollAnomalies({ tenantId });
  return Response.json({ ok: true, data });
}


