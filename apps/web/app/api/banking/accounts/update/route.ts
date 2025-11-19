import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { updateBankAccount } from "@/server/banking/accounts";

const Body = z.object({
  tenantId: z.string().optional(),
  entityId: z.string().optional(),
  id: z.string().min(1),
  name: z.string().optional(),
  currency: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("finance:banking:write");
    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);
    const { tenantId } = await assertTenantScope(body.tenantId);
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);
    await assertLegalEntityAccess(scope);
    const acct = await updateBankAccount(scope, body.id, { name: body.name, currency: body.currency });
    return Response.json({ ok: true, account: acct });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


