import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getPcnReport } from "@/server/healthcare/reports";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const pcnId = searchParams.get("pcnId");
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);
    if (!pcnId) {
      return Response.json({ ok: false, error: "pcnId required" }, { status: 400 });
    }
    const result = await getPcnReport(tenantId, pcnId, period);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

