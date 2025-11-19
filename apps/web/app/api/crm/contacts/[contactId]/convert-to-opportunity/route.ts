/**
 * Convert Contact to Opportunity
 * Phase 4A - Depth Pass: CRM/Sales pipeline
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { convertContactToOpportunity } from "@/server/crm/pipelines";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

const Body = z.object({
  name: z.string().min(1),
  value: z.number().optional(),
  expectedCloseDate: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["crm"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("crm:manage");
    if (!(await rateLimitTenant("crm", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);

    const opportunity = await convertContactToOpportunity(
      { tenantId, entityId: entityId || null },
      params.contactId,
      {
        name: body.name,
        value: body.value,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
        source: body.source,
      },
      userId
    );

    return Response.json({ ok: true, opportunity });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}

