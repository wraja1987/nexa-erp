import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { postGoodsReceipt } from "@/server/inventory/grn";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";

const Body = z.object({
  sku: z.string().min(1),
  qty: z.coerce.number().positive(),
  unitCostMinor: z.coerce.number().int().nonnegative(),
  warehouseId: z.string().optional(),
  locationId: z.string().optional(),
  tenantId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const len = Number(req.headers.get("content-length") || "0");
    if (len > 1_000_000) return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });

    await requirePermissionServer("inventory:receive_grn");
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || "{}"); });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);

    if (!(await rateLimitTenant("erp-mutating", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    Sentry.addBreadcrumb({ category: "erp.logic", message: "inventory.grn", level: "info", data: { tenantId, sku: body.sku, qty: body.qty } });

    const item = await postGoodsReceipt({ tenantId, sku: body.sku, qty: body.qty, unitCostMinor: body.unitCostMinor, warehouseId: body.warehouseId, locationId: body.locationId, actorId: userId });
    await incMetric("erp_inventory_grn_total", { tenant: tenantId, ok: 1 });
    return Response.json({ ok: true, item });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


