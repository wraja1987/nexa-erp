import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { consumeBomForWorkOrder } from "@/server/manufacturing/workorder";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";

const Body = z.object({ workOrderId: z.string().min(1), tenantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    await requirePermissionServer("mfg:consume_bom");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "mfg.consume_bom", level: "info", data: { tenantId, workOrderId: body.workOrderId } });

    const updated = await consumeBomForWorkOrder(tenantId, body.workOrderId, userId);
    await incMetric("erp_mfg_consume_bom_total", { tenant: tenantId, ok: 1 });
    return Response.json({ ok: true, workOrder: updated });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


