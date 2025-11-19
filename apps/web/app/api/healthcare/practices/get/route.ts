import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getPractice } from "@/server/healthcare/practices";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:healthcare:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const practiceId = searchParams.get("practiceId");
    if (!practiceId) {
      return Response.json({ ok: false, error: "practiceId required" }, { status: 400 });
    }
    const result = await getPractice(tenantId, practiceId);
    if (!result.practice) {
      return Response.json({ ok: false, error: result.message || "Practice not found" }, { status: 404 });
    }
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

