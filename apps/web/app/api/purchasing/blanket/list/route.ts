import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listBlanket } from "@/server/purchasing/blanket";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listBlanket({ tenantId });
  return Response.json({ ok: true, data });
}


