import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { buildMtdPayload } from "@/server/tax/hmrc-mtd";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:tax:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const vatReturnId = searchParams.get("vatReturnId") || "";
  const data = await buildMtdPayload({ tenantId }, vatReturnId);
  return Response.json({ ok: true, data });
}


