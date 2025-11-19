/**
 * Reject Quote
 * Phase 4A - Depth Pass: CRM/Sales pipeline
 */

import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { rejectQuote } from "@/server/sales/quotes";

export async function POST(
  req: NextRequest,
  { params }: { params: { quoteId: string } }
) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["sales"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("sales:manage");
    if (!(await rateLimitTenant("sales", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const quote = await rejectQuote(
      { tenantId, entityId: entityId || null },
      params.quoteId,
      userId
    );

    return Response.json({ ok: true, quote });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

