import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listProjects } from "@/server/projects/projects";

export async function GET() {
  await requirePermissionServer("ui:projects:view");
  const { tenantId } = await getSessionContext();
  const data = await listProjects({ tenantId });
  return Response.json({ ok: true, data });
}


