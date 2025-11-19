/**
 * Create Project Invoice
 * Phase 5B - Depth Pass: Wire billing invoice creation
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { rateLimitTenant } from "@/lib/rate-limit/tenant";
import { getTenantConfig } from "@/lib/access/tenantConfig";
import { buildBillingPreview, createProjectInvoice } from "@/server/projects/billing";
import { assertLegalEntityAccess } from "@/lib/finance/entity";

const Body = z.object({
  projectId: z.string().min(1),
  mode: z.enum(["TIME_AND_MATERIALS", "MILESTONE", "FIXED_FEE"]),
});

export async function POST(req: NextRequest) {
  try {
    const { tenantId, userId, entityId } = await assertTenantScope(undefined);
    const cfg = await getTenantConfig(tenantId);
    if (!cfg.modules?.["projects"]?.enabled) {
      return Response.json({ ok: false, error: "module_disabled" }, { status: 403 });
    }
    await requirePermissionServer("projects:manage");
    if (!(await rateLimitTenant("projects", tenantId, userId))) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const raw = await req.json().catch(async () => JSON.parse((await req.text()) || "{}"));
    const body = Body.parse(raw);

    // Build billing preview
    const preview = await buildBillingPreview(
      { tenantId, entityId: entityId || null },
      body.projectId,
      body.mode
    );

    // Create invoice
    const invoice = await createProjectInvoice(
      { tenantId, entityId: entityId || null },
      body.projectId,
      preview,
      userId
    );

    return Response.json({ ok: true, invoice });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


