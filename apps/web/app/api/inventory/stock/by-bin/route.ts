import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getStockByBin } from "@/server/inventory/stock";

export async function GET(req: NextRequest) {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const sku = searchParams.get("sku") || undefined;
  const data = await getStockByBin({ tenantId }, { sku });
  return Response.json({ ok: true, data });
}


