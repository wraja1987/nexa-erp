import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { confirmInvoiceFromOrder } from "@/server/sales/order-to-invoice";

export async function POST() {
  await requirePermissionServer("ui:sales:edit");
  const { tenantId } = await getSessionContext();
  try {
    const data = await confirmInvoiceFromOrder({ tenantId });
    return Response.json({ ok: true, data });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || "not_implemented") }, { status: e?.code || 501 });
  }
}


