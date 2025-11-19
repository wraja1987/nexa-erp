import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { approveSupplierBill } from "@/server/finance/lifecycle";

const Body = z.object({ billId: z.string().min(1), tenantId: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    const perm = await requirePermissionServer("finance:approve_bill");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, perm.userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "finance.approve_bill", level: "info", data: { tenantId, billId: body.billId } });
    const updated = await approveSupplierBill({ tenantId, billId: body.billId, actorId: userId });
    return Response.json({ ok: true, bill: updated });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


