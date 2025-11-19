import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { listTransfers } from "@/server/inventory/transfers";

export async function GET(req: NextRequest) {
  await requirePermissionServer("inventory:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") as any) || undefined;
  const data = await listTransfers({ tenantId }, { kind });
  return Response.json({ ok: true, data });
}


