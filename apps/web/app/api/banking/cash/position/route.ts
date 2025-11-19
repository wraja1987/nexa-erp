import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { getCashPosition } from "@/server/banking/cash";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const requestEntityId = searchParams.get("entityId") || undefined;
    const asOf = searchParams.get("asOf") ? new Date(String(searchParams.get("asOf"))) : new Date();
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const scope = await resolveLegalEntityScope(requestEntityId || tenantId);
    await assertLegalEntityAccess(scope);
    const data = await getCashPosition(scope, asOf);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


