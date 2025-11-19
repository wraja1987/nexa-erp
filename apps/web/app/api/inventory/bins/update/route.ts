import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { updateBin } from "@/server/inventory/bins";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("inventory:manage");
    const { tenantId } = await getSessionContext();
    const body = await req.json();
    if (!body?.id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
    const updated = await updateBin({ tenantId }, body.id, body);
    return Response.json({ ok: true, data: updated });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


