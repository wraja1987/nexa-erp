import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:finance_reports:view");
    const { searchParams } = new URL(req.url);
    const requestTenantId = searchParams.get("tenantId") || undefined;
    const entityId = searchParams.get("entityId") || null;
    await assertTenantScope(requestTenantId || undefined);
    await assertLegalEntityAccess(entityId);
    // Schema gap: payment currency not stored; cannot compute realised FX safely.
    return Response.json({
      ok: true,
      items: [],
      totals: { gain: 0, loss: 0 },
      note: "Schema gap: payment currency/rate capture required to compute realised FX. Report is empty by design.",
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


