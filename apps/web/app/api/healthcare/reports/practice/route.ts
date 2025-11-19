import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getPracticeReport } from "@/server/healthcare/reports";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const practiceId = searchParams.get("practiceId");
    const period = searchParams.get("period") || new Date().toISOString().slice(0, 7);
    if (!practiceId) {
      return Response.json({ ok: false, error: "practiceId required" }, { status: 400 });
    }
    const result = await getPracticeReport(tenantId, practiceId, period);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

