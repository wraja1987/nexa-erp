import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listOpportunities } from "@/server/crm/pipelines";

export async function GET() {
  await requirePermissionServer("ui:crm:view");
  const { tenantId } = await getSessionContext();
  const data = await listOpportunities({ tenantId });
  return Response.json({ ok: true, data });
}


