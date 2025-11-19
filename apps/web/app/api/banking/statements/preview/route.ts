import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { previewBankStatement } from "@/server/banking/statements";

const Body = z.object({
  tenantId: z.string().optional(),
  entityId: z.string().optional(),
  csv: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("bank:statement_import");
    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);
    const { tenantId } = await assertTenantScope(body.tenantId);
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);
    await assertLegalEntityAccess(scope);
    const res = await previewBankStatement(scope, body.csv);
    return Response.json({ ok: true, ...res });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


