import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getGlAnomalies } from "@/server/ai/tasks/glAnomaly";

export async function GET() {
  await requirePermissionServer("ui:ai:finance");
  const { tenantId } = await getSessionContext();
  const data = await getGlAnomalies({ tenantId });
  return Response.json({ ok: true, data });
}


