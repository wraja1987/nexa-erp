import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { createBlanket } from "@/server/purchasing/blanket";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:purchasing:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    const blanketPo = await createBlanket(
      scope,
      {
        supplierId: body.supplierId,
        number: body.number,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        lines: body.lines || [],
      },
      userId
    );

    return Response.json({ ok: true, data: blanketPo });
  } catch (error: any) {
    captureError(error, { module: "purchasing", operation: "create_blanket" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
