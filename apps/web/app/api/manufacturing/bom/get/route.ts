import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getBom } from "@/server/manufacturing/bom";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:manufacturing:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const parentItemCode = searchParams.get("parentItemCode");
    if (!parentItemCode) return Response.json({ ok: false, error: "missing_parent" }, { status: 400 });
    const data = await getBom({ tenantId }, parentItemCode);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


