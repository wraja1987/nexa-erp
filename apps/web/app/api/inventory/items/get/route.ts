import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getItem } from "@/server/inventory/items";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("inventory:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
    const data = await getItem({ tenantId }, id);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


