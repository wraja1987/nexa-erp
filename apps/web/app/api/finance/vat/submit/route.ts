import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { auditEvent } from "@/lib/observability/audit";

const Body = z.object({
  tenantId: z.string().optional(),
  periodKey: z.string().min(1),
  vrn: z.string().min(1),
  totals: z.object({
    box1: z.number(),
    box2: z.number(),
    box3: z.number(),
    box4: z.number(),
    box5: z.number(),
    box6: z.number(),
    box7: z.number(),
    box8: z.number(),
    box9: z.number(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("finance:vat_submit");
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);
    // Placeholder HMRC MTD integration stub: pretend accepted
    await auditEvent("finance.vat.return_submitted", {
      tenantId,
      actorId: userId,
      periodKey: body.periodKey,
      vrn: body.vrn,
      totals: body.totals,
      accepted: true,
    });
    return Response.json({ ok: true, submitted: true });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


