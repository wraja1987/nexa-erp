import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildInvoiceFromOrderPreview } from "@/server/sales/order-to-invoice";

export async function GET() {
  await requirePermissionServer("ui:sales:edit");
  const { tenantId } = await getSessionContext();
  try {
    const data = await buildInvoiceFromOrderPreview({ tenantId });
    return Response.json({ ok: true, data });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || "not_implemented") }, { status: e?.code || 501 });
  }
}


