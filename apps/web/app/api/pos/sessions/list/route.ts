import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listSessions } from "@/server/pos/sessions";

export async function GET() {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const data = await listSessions({ tenantId });
  return Response.json({ ok: true, data });
}


