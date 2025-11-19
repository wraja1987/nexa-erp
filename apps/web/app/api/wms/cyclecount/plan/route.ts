/**
 * Create Cycle Count Plan
 * Phase 5B - Depth Pass: Wire WMS cycle count service
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { createCycleCountPlan } from "@/server/wms/cyclecount";

const Body = z.object({
  warehouseId: z.string().min(1),
  name: z.string().min(1),
  frequency: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  lines: z.array(
    z.object({
      sku: z.string().min(1),
      locationId: z.string().optional().nullable(),
    })
  ),
});

export async function POST(req: NextRequest) {
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

    const plan = await createCycleCountPlan(
      { tenantId, entityId: entityId || null },
      body.warehouseId,
      body.name,
      body.frequency,
      new Date(body.startDate),
      new Date(body.endDate),
      body.lines,
      userId
    );

    return Response.json({ ok: true, plan });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

