import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getAllKpis } from "@/server/analytics/kpi";

export async function GET() {
  await requirePermissionServer("ui:analytics:view");
  const { tenantId } = await getSessionContext();
  const data = await getAllKpis({ tenantId });
  return Response.json({ ok: true, data });
}


