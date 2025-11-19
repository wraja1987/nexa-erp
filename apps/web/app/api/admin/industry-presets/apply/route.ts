import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { applyIndustryPreset } from "@/server/admin/industry-presets";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:manage");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { presetId } = body;
    if (!presetId) {
      return Response.json({ ok: false, error: "presetId required" }, { status: 400 });
    }
    const result = await applyIndustryPreset(tenantId, presetId, userId);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

