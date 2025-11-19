import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { createWarehouse } from "@/server/inventory/warehouses";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("inventory:manage");
    const { tenantId } = await getSessionContext();
    const body = await req.json();
    const created = await createWarehouse({ tenantId }, body);
    return Response.json({ ok: true, data: created });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


