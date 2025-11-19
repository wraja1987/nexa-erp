import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { applyCoaTemplate } from "@/server/admin/coa-templates";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:manage");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const { templateId } = body;
    if (!templateId) {
      return Response.json({ ok: false, error: "templateId required" }, { status: 400 });
    }
    const result = await applyCoaTemplate(tenantId, templateId, userId);
    if (!result.supported) {
      return Response.json({ ok: false, error: result.message || "Not supported" }, { status: 400 });
    }
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

