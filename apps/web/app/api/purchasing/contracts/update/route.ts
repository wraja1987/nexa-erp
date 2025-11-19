import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { updateContract } from "@/server/purchasing/contracts";
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

    const contract = await updateContract(
      scope,
      body.id,
      {
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : undefined }),
        ...(body.status && { status: body.status }),
        ...(body.terms !== undefined && { terms: body.terms }),
      },
      userId
    );

    return Response.json({ ok: true, data: contract });
  } catch (error: any) {
    captureError(error, { module: "purchasing", operation: "update_contract" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
