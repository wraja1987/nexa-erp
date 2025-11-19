import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listLandedCosts } from "@/server/purchasing/landed";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listLandedCosts({ tenantId });
  return Response.json({ ok: true, data });
}


