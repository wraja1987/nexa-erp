import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listContacts } from "@/server/crm/contacts";

export async function GET() {
  await requirePermissionServer("ui:crm:view");
  const { tenantId } = await getSessionContext();
  const data = await listContacts({ tenantId });
  return Response.json({ ok: true, data });
}


