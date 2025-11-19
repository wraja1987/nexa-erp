/**
 * Approve Cycle Count Variance
 * Phase 5B - Depth Pass: Wire cycle count approval
 */

import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { approveCycleCountVariance } from "@/server/wms/cyclecount";

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

    const line = await approveCycleCountVariance(
      { tenantId, entityId: entityId || null },
      params.lineId,
      userId
    );

    return Response.json({ ok: true, line });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

