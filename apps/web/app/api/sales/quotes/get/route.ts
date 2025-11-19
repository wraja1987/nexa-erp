import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getQuote } from "@/server/sales/quotes";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:sales:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
  try {
    const data = await getQuote({ tenantId }, id);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message || "not_found") }, { status: e?.code || 404 });
  }
}


