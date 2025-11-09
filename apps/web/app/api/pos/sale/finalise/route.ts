import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { finalisePosSale } from "@/server/pos/sales";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { idempotentGet, idempotentSet } from "@/lib/http/idempotency";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";

const Body = z.object({ saleId: z.string().min(1), tenantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    await requirePermissionServer("pos:finalise_sale");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const idempKey = req.headers.get("idempotency-key") || `pos-finalise:${tenantId}:${body.saleId}`;
    const hit = await idempotentGet<any>(idempKey);
    if (hit) return Response.json(hit, { status: 200 });

    Sentry.addBreadcrumb({ category: "erp.logic", message: "pos.finalise", level: "info", data: { tenantId, saleId: body.saleId } });

    const updated = await finalisePosSale(tenantId, body.saleId, userId);
    await incMetric("erp_pos_finalise_total", { tenant: tenantId, ok: 1 });
    const payload = { ok: true, sale: updated };
    await idempotentSet(idempKey, payload, 300);
    return Response.json(payload);
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


