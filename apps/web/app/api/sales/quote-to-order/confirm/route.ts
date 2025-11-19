import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { confirmOrderFromQuote } from "@/server/sales/quote-to-order";

export async function POST() {
  await requirePermissionServer("ui:sales:edit");
  const { tenantId } = await getSessionContext();
  try {
    const data = await confirmOrderFromQuote({ tenantId });
    return Response.json({ ok: true, data });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || "not_implemented") }, { status: e?.code || 501 });
  }
}


