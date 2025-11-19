import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { updateBlanket } from "@/server/purchasing/blanket";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:purchasing:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    if (!body.id) {
      return Response.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    const blanketPo = await updateBlanket(
      scope,
      body.id,
      {
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.status && { status: body.status }),
      },
      userId
    );

    return Response.json({ ok: true, data: blanketPo });
  } catch (error: any) {
    captureError(error, { module: "purchasing", operation: "update_blanket" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
