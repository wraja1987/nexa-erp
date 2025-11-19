import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getSupplierPerformance } from "@/server/purchasing/performance";

export async function GET() {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const data = await getSupplierPerformance({ tenantId });
  return Response.json(data);
}


