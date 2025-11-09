import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

const Body = z.object({
  tenantId: z.string().optional(),
  runId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("hr:payroll_run");
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);
    // Placeholder: mark payroll run calculated and emit audit
    const run = await prisma.payrollRun.update({ where: { id: body.runId }, data: { status: "calculated" } });
    await auditEvent("hr.payroll.calculated", { tenantId, actorId: userId, runId: run.id });
    return Response.json({ ok: true, run });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


