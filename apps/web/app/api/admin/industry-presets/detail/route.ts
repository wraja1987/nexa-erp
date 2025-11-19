import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getIndustryPresetDetail } from "@/server/admin/industry-presets";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:view");
    const { searchParams } = new URL(req.url);
    const presetId = searchParams.get("presetId") as any;
    if (!presetId) {
      return Response.json({ ok: false, error: "presetId required" }, { status: 400 });
    }
    const preset = await getIndustryPresetDetail(presetId);
    if (!preset) {
      return Response.json({ ok: false, error: "Preset not found" }, { status: 404 });
    }
    return Response.json({ ok: true, data: preset });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

