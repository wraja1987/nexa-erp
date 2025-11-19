import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getXReport } from "@/server/pos/reports";

export async function GET() {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const data = await getXReport({ tenantId });
  return Response.json({ ok: true, data });
}


