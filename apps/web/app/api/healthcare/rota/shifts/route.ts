import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listShiftsForRota } from "@/server/healthcare/rota";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const rotaId = searchParams.get("rotaId");
    if (!rotaId) {
      return Response.json({ ok: false, error: "rotaId required" }, { status: 400 });
    }
    const result = await listShiftsForRota(tenantId, rotaId);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

