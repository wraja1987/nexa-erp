import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getSupplier } from "@/server/purchasing/suppliers";

export async function GET(req: NextRequest) {
  await requirePermissionServer("ui:purchasing:view");
  const { tenantId } = await getSessionContext();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ ok: false, error: "missing_id" }, { status: 400 });
  const data = await getSupplier({ tenantId }, id);
  return Response.json({ ok: true, data });
}


