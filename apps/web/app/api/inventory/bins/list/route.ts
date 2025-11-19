import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listBins } from "@/server/inventory/bins";

export async function GET(req: NextRequest) {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouseId") || undefined;
  const data = await listBins({ tenantId }, warehouseId);
  return Response.json({ ok: true, data });
}


