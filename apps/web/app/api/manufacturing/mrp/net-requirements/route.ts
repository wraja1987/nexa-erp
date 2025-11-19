import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { calculateNetRequirements } from "@/server/manufacturing/mrp";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const horizonDays = Number(searchParams.get("horizonDays") || "30");
  const data = await calculateNetRequirements({ tenantId }, { horizonDays });
  return Response.json({ ok: true, data });
}


