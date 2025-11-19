import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listActivities } from "@/server/crm/activities";

export async function GET() {
  await requirePermissionServer("ui:crm:view");
  const { tenantId } = await getSessionContext();
  const data = await listActivities({ tenantId });
  return Response.json({ ok: true, data });
}


