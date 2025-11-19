import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getRouting } from "@/server/manufacturing/routings";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const workOrderId = searchParams.get("workOrderId");
  if (!workOrderId) return Response.json({ ok: false, error: "missing_workOrderId" }, { status: 400 });
  const data = await getRouting({ tenantId }, workOrderId);
  return Response.json({ ok: true, data });
}


