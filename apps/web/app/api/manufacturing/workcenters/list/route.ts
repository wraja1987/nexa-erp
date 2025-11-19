import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listWorkCenters } from "@/server/manufacturing/workcenters";

export async function GET() {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const data = await listWorkCenters({ tenantId });
  return Response.json({ ok: true, data });
}


