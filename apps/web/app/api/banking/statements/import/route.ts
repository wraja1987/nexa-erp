import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { importBankStatement } from "@/server/banking/statements";
import { idempotentGet, idempotentSet } from "@/lib/http/idempotency";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";

const Body = z.object({
  tenantId: z.string().optional(),
  entityId: z.string().optional(),
  accountCode: z.string().min(1),
  csv: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("bank:statement_import");
    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);
    await assertLegalEntityAccess(scope);
    const idk = req.headers.get("idempotency-key") || "";
    if (!(await rateLimitTenant("erp-mutating", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    if (idk) {
      const hit = await idempotentGet<any>(`bankimp:${tenantId}:${idk}`);
      if (hit) return Response.json(hit, { status: 409 });
    }
    const res = await importBankStatement(scope, body.csv, body.accountCode);
    const payload = { ok: true, ...res };
    if (idk) await idempotentSet(`bankimp:${tenantId}:${idk}`, payload, 3600);
    return Response.json(payload, { status: 201 });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


