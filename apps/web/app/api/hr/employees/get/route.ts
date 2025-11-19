import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("hr:employees:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const requestEntityId = searchParams.get("entityId") || undefined;
    const id = searchParams.get("id") || "";
    if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const scope = await resolveLegalEntityScope(requestEntityId || tenantId);
    await assertLegalEntityAccess(scope);
    const employee = await prisma.employee.findFirst({ where: { id, tenantId: scope.tenantId } });
    if (!employee) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    return Response.json({ ok: true, employee });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


