import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listWarehouses } from "@/server/inventory/warehouses";

export async function GET() {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const data = await listWarehouses({ tenantId });
  return Response.json({ ok: true, data });
}


