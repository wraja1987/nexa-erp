/**
 * Billing Preview
 * Phase 5B - Depth Pass: Wire billing preview
 */

import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { buildBillingPreview } from "@/server/projects/billing";

export async function GET(req: NextRequest) {
  try {
    const { tenantId, entityId } = await assertTenantScope(undefined);
    await requirePermissionServer("projects:view");
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || "";
    const mode = (searchParams.get("mode") || "TIME_AND_MATERIALS") as any;
    
    const data = await buildBillingPreview(
      { tenantId, entityId: entityId || null },
      projectId,
      mode
    );
    
    return Response.json({ ok: true, data });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


