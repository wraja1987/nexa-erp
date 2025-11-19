import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildVatSummary } from "@/server/tax/vat";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:tax:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;
  const data = await buildVatSummary({ tenantId }, { start, end });
  return Response.json({ ok: true, data });
}


