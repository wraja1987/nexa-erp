import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listPurchaseOrders } from "@/server/purchasing/po";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await listPurchaseOrders({ tenantId });
  return Response.json({ ok: true, data });
}


