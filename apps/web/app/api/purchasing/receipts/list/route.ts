import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listReceipts } from "@/server/purchasing/receipts";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listReceipts({ tenantId });
  return Response.json({ ok: true, data });
}


