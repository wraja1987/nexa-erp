import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listRetainers } from "@/server/projects/retainers";

export async function GET() {
  await requirePermissionServer("ui:projects:view");
  const { tenantId } = await getSessionContext();
  const data = await listRetainers({ tenantId });
  return Response.json({ ok: true, data });
}


