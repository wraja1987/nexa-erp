import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getManagementCommentary } from "@/server/ai/tasks/managementCommentary";

export async function GET() {
  await requirePermissionServer("ui:analytics:view");
  const { tenantId } = await getSessionContext();
  const data = await getManagementCommentary({ tenantId });
  return Response.json({ ok: true, data });
}


