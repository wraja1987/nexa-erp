import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getStockSummary } from "@/server/inventory/stock";

export async function GET() {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const data = await getStockSummary({ tenantId });
  return Response.json({ ok: true, data });
}


