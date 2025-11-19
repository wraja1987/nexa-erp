import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildAuditPack } from "@/server/tax/audit-pack";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:reports:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;
  const data = await buildAuditPack({ tenantId }, { start, end });
  return Response.json({ ok: true, data });
}


