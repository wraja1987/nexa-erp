import { NextRequest } from "next/server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getSessionContext } from "@/lib/auth/tenant.server";
import { getTenantRegion } from "@/server/security/byokProvider";
import { getAllowedRegionsForModule } from "@/server/security/dataResidency";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:admin:super");
    const { tenantId } = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const targetTenantId = searchParams.get("tenantId") || tenantId;

    const tenantRegion = await getTenantRegion(targetTenantId);

    // Get allowed regions for key modules
    const allowedRegions: Record<string, string[]> = {
      finance: getAllowedRegionsForModule("finance"),
      hr: getAllowedRegionsForModule("hr"),
      payroll: getAllowedRegionsForModule("payroll"),
      billing: getAllowedRegionsForModule("billing"),
      healthcare: getAllowedRegionsForModule("healthcare"),
      banking: getAllowedRegionsForModule("banking"),
      pos: getAllowedRegionsForModule("pos"),
      tax: getAllowedRegionsForModule("tax"),
      analytics: getAllowedRegionsForModule("analytics"),
      ai: getAllowedRegionsForModule("ai"),
    };

    // Check enforcement status for each module
    const moduleStatus: Record<string, { allowed: boolean; reason?: string }> = {};
    for (const [module, regions] of Object.entries(allowedRegions)) {
      const allowed = tenantRegion === "UNKNOWN" || regions.includes(tenantRegion);
      moduleStatus[module] = {
        allowed,
        reason: allowed ? undefined : `Region ${tenantRegion} not in allowed regions: ${regions.join(", ")}`,
      };
    }

    return Response.json({
      ok: true,
      data: {
        tenantRegion,
        allowedRegions,
        moduleStatus,
        enforced: tenantRegion !== "UNKNOWN",
        reason: tenantRegion === "UNKNOWN" ? "Tenant region not configured. Set region in TenantConfig.config.region" : undefined,
      },
    });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}
