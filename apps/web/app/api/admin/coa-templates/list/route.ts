import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listCoaTemplates } from "@/server/admin/coa-templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:view");
    const { tenantId } = await getSessionContext();
    const templates = await listCoaTemplates(tenantId);
    return Response.json({ ok: true, data: templates });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

