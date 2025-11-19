import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { getPnL } from "@/server/finance/gl";
import { parseDimensionFilters } from "@/lib/finance/dimensions";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const entityId = searchParams.get("entityId") || null;
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    // Validate entity access (future-ready). Current GL is tenant-scoped only.
    await assertLegalEntityAccess(entityId);
    const dims = parseDimensionFilters(searchParams);
    const data = await getPnL(tenantId, dims);
    return Response.json({ ok: true, data, scope: { tenantId, entityId }, dimensionsApplied: false });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


