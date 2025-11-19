import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { allocateLandedCost } from "@/server/purchasing/landed";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:purchasing:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    const landedCost = await allocateLandedCost(
      scope,
      {
        poId: body.poId,
        asnId: body.asnId,
        type: body.type,
        amount: Number(body.amount),
        allocatedTo: body.allocatedTo || "inventory",
      },
      userId
    );

    return Response.json({ ok: true, data: landedCost });
  } catch (error: any) {
    captureError(error, { module: "purchasing", operation: "allocate_landed_cost" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
