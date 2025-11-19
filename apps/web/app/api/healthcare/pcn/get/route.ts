import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getPcn } from "@/server/healthcare/pcn";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const pcnId = searchParams.get("pcnId");
    if (!pcnId) {
      return Response.json({ ok: false, error: "pcnId required" }, { status: 400 });
    }
    const result = await getPcn(tenantId, pcnId);
    if (!result.pcn) {
      return Response.json({ ok: false, error: result.message || "PCN not found" }, { status: 404 });
    }
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

