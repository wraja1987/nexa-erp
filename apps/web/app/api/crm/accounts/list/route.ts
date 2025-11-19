import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listAccounts } from "@/server/crm/accounts";

export async function GET() {
  await requirePermissionServer("ui:crm:view");
  const { tenantId } = await getSessionContext();
  const data = await listAccounts({ tenantId });
  return Response.json({ ok: true, data });
}


