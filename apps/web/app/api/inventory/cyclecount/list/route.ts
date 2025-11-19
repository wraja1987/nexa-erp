import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listCycleCountPlans } from "@/server/inventory/cyclecount";

export async function GET() {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const data = await listCycleCountPlans({ tenantId });
  return Response.json({ ok: true, data });
}


