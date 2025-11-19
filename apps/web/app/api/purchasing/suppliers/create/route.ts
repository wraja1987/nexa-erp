import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { createSupplier } from "@/server/purchasing/suppliers";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:purchasing:edit");
    const { tenantId } = await getSessionContext();
    const body = await req.json();
    const data = await createSupplier({ tenantId }, body);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


