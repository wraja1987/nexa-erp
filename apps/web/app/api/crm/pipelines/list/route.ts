import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listPipelines } from "@/server/crm/pipelines";

export async function GET() {
  await requirePermissionServer("ui:crm:view");
  const { tenantId } = await getSessionContext();
  const data = await listPipelines({ tenantId });
  return Response.json({ ok: true, data });
}


