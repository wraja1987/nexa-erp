import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { payCustomerInvoice } from "@/server/finance/lifecycle";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { idempotentGet, idempotentSet } from "@/lib/http/idempotency";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";

const Body = z.object({
  invoiceId: z.string().min(1),
  amountMinor: z.coerce.number().int().positive(),
  method: z.string().min(1),
  reference: z.string().optional(),
  tenantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    const perm = await requirePermissionServer("finance:record_payment");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, perm.userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const idempKey = req.headers.get("idempotency-key") || (body.reference ? `pay:${tenantId}:${body.invoiceId}:${body.reference}` : "");
    if (idempKey) {
      const hit = await idempotentGet<any>(idempKey);
      if (hit) return Response.json(hit, { status: 200 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "finance.pay", level: "info", data: { tenantId, invoiceId: body.invoiceId } });

    const updated = await payCustomerInvoice({ tenantId, invoiceId: body.invoiceId, amountMinor: body.amountMinor, method: body.method, reference: body.reference, actorId: userId });
    await incMetric("erp_finance_paid_total", { tenant: tenantId, ok: 1 });
    const payload = { ok: true, invoice: updated };
    if (idempKey) await idempotentSet(idempKey, payload, 300);
    return Response.json(payload);
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


