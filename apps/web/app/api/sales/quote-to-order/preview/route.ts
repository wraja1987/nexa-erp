import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildOrderFromQuotePreview } from "@/server/sales/quote-to-order";

export async function GET() {
  await requirePermissionServer("ui:sales:edit");
  const { tenantId } = await getSessionContext();
  try {
    const data = await buildOrderFromQuotePreview({ tenantId });
    return Response.json({ ok: true, data });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || "not_implemented") }, { status: e?.code || 501 });
  }
}


