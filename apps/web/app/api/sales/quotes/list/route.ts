import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listQuotes } from "@/server/sales/quotes";

export async function GET() {
  await requirePermissionServer("ui:sales:view");
  const { tenantId } = await getSessionContext();
  const data = await listQuotes({ tenantId });
  return Response.json({ ok: true, data });
}


