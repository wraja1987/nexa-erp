import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listVatReturns } from "@/server/tax/vat";

export async function GET() {
  await requirePermissionServer("ui:tax:view");
  const { tenantId } = await getSessionContext();
  const data = await listVatReturns({ tenantId });
  return Response.json({ ok: true, data });
}


