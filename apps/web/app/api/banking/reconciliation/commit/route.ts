import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { reconcileMatch } from "@/server/banking/reconciliation";

const Body = z.object({
  tenantId: z.string().optional(),
  entityId: z.string().optional(),
  bankLineId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("finance:banking:write");
    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);
    const { tenantId } = await assertTenantScope(body.tenantId);
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);
    await assertLegalEntityAccess(scope);
    const res = await reconcileMatch(scope, body.bankLineId);
    return Response.json({ ok: true, ...res });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


