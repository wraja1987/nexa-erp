import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listVariances } from "@/server/inventory/variance";

export async function GET() {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const data = await listVariances({ tenantId });
  return Response.json({ ok: true, data });
}


