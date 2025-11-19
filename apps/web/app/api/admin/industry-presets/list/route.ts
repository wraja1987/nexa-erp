import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { listIndustryPresets } from "@/server/admin/industry-presets";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:view");
    const presets = await listIndustryPresets();
    return Response.json({ ok: true, data: presets });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

