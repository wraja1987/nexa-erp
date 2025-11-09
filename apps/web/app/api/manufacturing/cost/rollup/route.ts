import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/observability/audit";

const Body = z.object({
  tenantId: z.string().optional(),
  workOrderId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("mfg:cost_rollup");
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);
    // Placeholder: compute roll-up as sum of RoutingStep durations * 10 minor per minute
    const steps = await prisma.routingStep.findMany({ where: { tenantId, workOrderId: body.workOrderId } });
    const totalMins = steps.reduce((s, st) => s + Number(st.durationMins || 0), 0);
    const costMinor = totalMins * 10;
    await auditEvent("mfg.cost.rollup", { tenantId, actorId: userId, workOrderId: body.workOrderId, totalMins, costMinor });
    return Response.json({ ok: true, costMinor });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


