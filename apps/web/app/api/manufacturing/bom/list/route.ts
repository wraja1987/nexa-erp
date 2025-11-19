import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listBoms } from "@/server/manufacturing/bom";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:manufacturing:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const parentItemCode = searchParams.get("parentItemCode") || undefined;
  const data = await listBoms({ tenantId }, { parentItemCode });
  return Response.json({ ok: true, data });
}


