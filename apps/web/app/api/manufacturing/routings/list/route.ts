import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listRoutings } from "@/server/manufacturing/routings";

export async function GET() {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const data = await listRoutings({ tenantId });
  return Response.json({ ok: true, data });
}


