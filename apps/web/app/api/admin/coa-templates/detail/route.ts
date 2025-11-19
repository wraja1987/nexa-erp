import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getCoaTemplateDetail } from "@/server/admin/coa-templates";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:view");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId") as any;
    if (!templateId) {
      return Response.json({ ok: false, error: "templateId required" }, { status: 400 });
    }
    const template = await getCoaTemplateDetail(tenantId, templateId);
    if (!template) {
      return Response.json({ ok: false, error: "Template not found" }, { status: 404 });
    }
    return Response.json({ ok: true, data: template });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

