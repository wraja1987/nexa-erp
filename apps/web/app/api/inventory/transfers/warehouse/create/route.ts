import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { createWarehouseTransfer } from "@/server/inventory/transfers";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("inventory:manage");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const payload = { ...body, actorId: userId };
    const result = await createWarehouseTransfer({ tenantId }, payload);
    return Response.json({ ok: true, data: result });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


