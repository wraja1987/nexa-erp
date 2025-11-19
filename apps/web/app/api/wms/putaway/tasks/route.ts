/**
 * Create Putaway Tasks
 * Phase 5B - Depth Pass: Wire WMS putaway service
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { createPutawayTasks } from "@/server/wms/putaway";

const Body = z.object({
  grnId: z.string().min(1),
  tasks: z.array(
    z.object({
      sku: z.string().min(1),
      qty: z.number().positive(),
      fromLocationId: z.string().optional().nullable(),
      toLocationId: z.string().min(1),
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

    const tasks = await createPutawayTasks(
      { tenantId, entityId: entityId || null },
      body.grnId,
      body.tasks,
      userId
    );

    return Response.json({ ok: true, tasks });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

