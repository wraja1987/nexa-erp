/**
 * Issue Materials to Work Order
 * Phase 5B - Depth Pass: Wire material issue service
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { issueMaterialsToWorkOrder } from "@/server/manufacturing/material-issue";

const Body = z.object({
  workOrderId: z.string().min(1),
  issues: z.array(
    z.object({
      sku: z.string().min(1),
      qty: z.number().positive(),
      locationId: z.string().optional().nullable(),
      lotId: z.string().optional().nullable(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["manufacturing"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("manufacturing:manage");
    if (!(await rateLimitTenant("manufacturing", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);

    const materialIssues = await issueMaterialsToWorkOrder(
      { tenantId, entityId: entityId || null },
      body.workOrderId,
      body.issues,
      userId
    );

    return Response.json({ ok: true, materialIssues });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


