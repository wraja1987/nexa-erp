import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope } from "@/lib/finance/entity";
import { createDraftVatReturn } from "@/server/tax/vat";
import { captureError } from "@/server/observability/sentry";

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("ui:tax:edit");
    const { tenantId, userId } = await getSessionContext();
    const body = await req.json();
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);

    if (!body.vrn || !body.periodKey || !body.start || !body.end) {
      return Response.json({ ok: false, error: "vrn, periodKey, start, and end are required" }, { status: 400 });
    }

    const vatReturn = await createDraftVatReturn(
      scope,
      {
        start: new Date(body.start),
        end: new Date(body.end),
        periodKey: body.periodKey,
      },
      body.vrn,
      userId
    );

    return Response.json({ ok: true, data: vatReturn.data });
  } catch (error: any) {
    captureError(error, { module: "tax", operation: "create_draft_vat_return" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}
