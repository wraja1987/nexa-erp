import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getCashupPreview } from "@/server/pos/cashup";

export async function GET() {
  await requirePermissionServer("ui:pos:view");
  const { tenantId } = await getSessionContext();
  const data = await getCashupPreview({ tenantId });
  return Response.json({ ok: true, data });
}


