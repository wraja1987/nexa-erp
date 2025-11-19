import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildGccEinvoicePayload } from "@/server/tax/gcc-einvoice";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:tax:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("invoiceId") || "";
  const data = await buildGccEinvoicePayload({ tenantId }, invoiceId);
  return Response.json({ ok: true, data });
}


