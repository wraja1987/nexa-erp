/**
 * Create POS Refund
 * Phase 5B - Depth Pass: Wire POS refund service
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { createPosRefund } from "@/server/pos/refunds";

const Body = z.object({
  saleId: z.string().min(1),
  reason: z.string().optional(),
  lines: z.array(
    z.object({
      lineId: z.string().min(1),
      qty: z.number().positive(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["pos"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("pos:manage");
    if (!(await rateLimitTenant("pos", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);

    const refund = await createPosRefund(
      { tenantId, entityId: entityId || null },
      {
        saleId: body.saleId,
        reason: body.reason,
        lines: body.lines,
      },
      userId
    );

    return Response.json({ ok: true, refund });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

