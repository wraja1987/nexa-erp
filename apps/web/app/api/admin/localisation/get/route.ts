import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getTenantLocalisation } from "@/server/admin/localisation";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:view");
    const { tenantId } = await getSessionContext();
    const localisation = await getTenantLocalisation(tenantId);
    return Response.json({ ok: true, data: localisation });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

