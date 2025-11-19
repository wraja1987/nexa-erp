import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { assertLegalEntityAccess, resolveLegalEntityScope } from "@/lib/finance/entity";
import { buildRevenueScheduleForTenant } from "@/server/finance/revenue";
import { parseDimensionFilters } from "@/lib/finance/dimensions";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const requestEntityId = searchParams.get("entityId") || undefined;
    const from = searchParams.get("from") ? new Date(String(searchParams.get("from"))) : undefined;
    const to = searchParams.get("to") ? new Date(String(searchParams.get("to"))) : undefined;
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const scope = await resolveLegalEntityScope(requestEntityId || tenantId);
    await assertLegalEntityAccess(scope);
    const dims = parseDimensionFilters(searchParams);
    const data = await buildRevenueScheduleForTenant(scope, from, to, dims);
    return Response.json({ ok: true, scope: { tenantId: scope.tenantId, entityId: scope.entityId, from: from?.toISOString(), to: to?.toISOString() }, dimensionsApplied: false, ...data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


