import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getZReport } from "@/server/pos/reports";

export async function GET() {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const data = await getZReport({ tenantId });
  return Response.json({ ok: true, data });
}


