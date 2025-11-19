import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { listEmployees } from "@/server/hr/employees";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("hr:employees:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const requestEntityId = searchParams.get("entityId") || undefined;
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const scope = await resolveLegalEntityScope(requestEntityId || tenantId);
    await assertLegalEntityAccess(scope);
    const employees = await listEmployees(scope);
    return Response.json({ ok: true, employees });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


