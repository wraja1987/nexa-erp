import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listTimesheets } from "@/server/projects/timesheets";

export async function GET() {
  await requirePermissionServer("ui:projects:view");
  const { tenantId } = await getSessionContext();
  const data = await listTimesheets({ tenantId });
  return Response.json({ ok: true, data });
}


