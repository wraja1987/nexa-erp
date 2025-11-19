import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listOrders } from "@/server/sales/orders";

export async function GET() {
  await requirePermissionServer("ui:sales:view");
  const { tenantId } = await getSessionContext();
  const data = await listOrders({ tenantId });
  return Response.json({ ok: true, data });
}


