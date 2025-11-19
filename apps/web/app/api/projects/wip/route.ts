import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getWipSummary } from "@/server/projects/profitability";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:projects:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || "";
  const data = await getWipSummary({ tenantId }, projectId);
  return Response.json({ ok: true, data });
}


