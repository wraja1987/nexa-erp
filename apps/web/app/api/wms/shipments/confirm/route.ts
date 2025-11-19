/**
 * Confirm Shipment
 * Phase 5B - Depth Pass: Wire WMS shipment confirmation
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { confirmShipment } from "@/server/wms/pick-ship";

const Body = z.object({
  shipmentNumber: z.string().min(1),
  orderId: z.string().min(1),
  orderType: z.string().min(1),
  warehouseId: z.string().min(1),
  lines: z.array(
    z.object({
      sku: z.string().min(1),
      qty: z.number().positive(),
    })
  ),
  carrier: z.string().optional(),
  tracking: z.string().optional(),
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

    const shipment = await confirmShipment(
      { tenantId, entityId: entityId || null },
      body.shipmentNumber,
      body.orderId,
      body.orderType,
      body.warehouseId,
      body.lines,
      body.carrier,
      body.tracking,
      userId
    );

    return Response.json({ ok: true, shipment });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

