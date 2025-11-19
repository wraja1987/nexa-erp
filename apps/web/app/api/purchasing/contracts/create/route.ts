import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { createContract } from "@/server/purchasing/contracts";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:purchasing:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    const contract = await createContract(
      scope,
      {
        supplierId: body.supplierId,
        code: body.code,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        terms: body.terms,
        tiers: body.tiers || [],
      },
      userId
    );

    return Response.json({ ok: true, data: contract });
  } catch (error: any) {
    captureError(error, { module: "purchasing", operation: "create_contract" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
