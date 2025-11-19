import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listItems } from "@/server/inventory/items";

export async function GET(req: NextRequest) {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const sku = searchParams.get("sku") || undefined;
  const warehouseId = searchParams.get("warehouseId") || undefined;
  const locationId = searchParams.get("locationId") || undefined;
  const data = await listItems({ tenantId }, { sku, warehouseId, locationId });
  return Response.json({ ok: true, data });
}


