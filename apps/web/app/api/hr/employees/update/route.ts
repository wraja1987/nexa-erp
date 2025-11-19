import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { resolveLegalEntityScope, assertLegalEntityAccess } from "@/lib/finance/entity";
import { updateEmployee } from "@/server/hr/employees";

const Body = z.object({
  tenantId: z.string().optional(),
  entityId: z.string().optional(),
  id: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("hr:employees:write");
    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);
    const { tenantId } = await assertTenantScope(body.tenantId);
    const scope = await resolveLegalEntityScope(body.entityId || tenantId);
    await assertLegalEntityAccess(scope);
    const emp = await updateEmployee(scope, body.id, { firstName: body.firstName, lastName: body.lastName, email: body.email });
    return Response.json({ ok: true, employee: emp });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


