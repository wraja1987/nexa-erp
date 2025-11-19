import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { startWorkOrder } from "@/server/manufacturing/workorders";

export async function POST(req: NextRequest) {
  try {
    const perm = await requirePermissionServer("ui:manufacturing:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const data = await startWorkOrder({ tenantId }, body?.id, userId, perm.role);
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


