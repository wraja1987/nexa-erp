import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getInventoryAnomalies } from "@/server/ai/tasks/inventoryAnomaly";

export async function GET() {
  await requirePermissionServer("ui:ai:inventory");
  const { tenantId } = await getSessionContext();
  const data = await getInventoryAnomalies({ tenantId });
  return Response.json({ ok: true, data });
}


