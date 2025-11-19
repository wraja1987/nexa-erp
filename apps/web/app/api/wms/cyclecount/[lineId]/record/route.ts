/**
 * Record Cycle Count Result
 * Phase 5B - Depth Pass: Wire cycle count recording
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { recordCycleCountResult } from "@/server/wms/cyclecount";

const Body = z.object({
  countedQty: z.number().nonnegative(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["inventory"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("inventory:manage");
    if (!(await rateLimitTenant("inventory", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);

    const line = await recordCycleCountResult(
      { tenantId, entityId: entityId || null },
      params.lineId,
      body.countedQty,
      userId
    );

    return Response.json({ ok: true, line });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

