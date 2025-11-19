import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listPickableOrders } from "@/server/inventory/fulfilment";

export async function GET() {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const data = await listPickableOrders({ tenantId });
  return Response.json({ ok: true, data });
}


