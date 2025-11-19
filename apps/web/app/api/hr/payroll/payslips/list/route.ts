import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("hr:payroll:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const { tenantId } = await assertTenantScope(requestTenantId || undefined);
    const slips = await prisma.payslip.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    return Response.json({ ok: true, slips });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


