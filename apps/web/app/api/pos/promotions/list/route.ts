import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listPromotions } from "@/server/pos/promotions";

export async function GET() {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const data = await listPromotions({ tenantId });
  return Response.json({ ok: true, data });
}


