import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listWorkOrders } from "@/server/manufacturing/workorders";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const data = await listWorkOrders({ tenantId }, { status: status || undefined });
  return Response.json({ ok: true, data });
}


