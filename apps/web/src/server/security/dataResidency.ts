/**
 * Data Residency Guards
 * Task 8 Gap Closure: Full DB-backed implementation using TenantConfig
 */

import { getTenantRegion, type TenantRegion } from "./byokProvider";

export interface ResidencyGuardResult {
  allowed: boolean;
  tenantRegion: TenantRegion;
  reason?: string;
}

/**
 * Assert that an operation is allowed for the tenant's region.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function assertResidencyAllowed(
  tenantId: string,
  requiredRegion: TenantRegion | TenantRegion[],
  module?: string
): Promise<ResidencyGuardResult> {
  const tenantRegion = await getTenantRegion(tenantId);
  const requiredRegions = Array.isArray(requiredRegion) ? requiredRegion : [requiredRegion];

  // If required regions include UNKNOWN, always allow
  if (requiredRegions.includes("UNKNOWN")) {
    return {
      allowed: true,
      tenantRegion,
    };
  }

  // If tenant region is UNKNOWN, deny with reason (config missing, not schema gap)
  if (tenantRegion === "UNKNOWN") {
    return {
      allowed: false,
      tenantRegion,
      reason: "Tenant region not configured. Set region in TenantConfig.config.region",
    };
  }

  // Check if tenant region is in required regions
  if (!requiredRegions.includes(tenantRegion)) {
    return {
      allowed: false,
      tenantRegion,
      reason: `Tenant region ${tenantRegion} is not in required regions: ${requiredRegions.join(", ")}${module ? ` (module: ${module})` : ""}`,
    };
  }

  return {
    allowed: true,
    tenantRegion,
  };
}

/**
 * Get allowed regions for a module.
 * Returns hard-coded mapping based on compliance requirements.
 */
export function getAllowedRegionsForModule(module: string): TenantRegion[] {
  const mapping: Record<string, TenantRegion[]> = {
    finance: ["UK", "EU", "GCC"],
    hr: ["UK", "EU"],
    payroll: ["UK", "EU"],
    billing: ["UK", "EU", "GCC"],
    healthcare: ["UK", "EU"],
    banking: ["UK", "EU", "GCC"],
    pos: ["UK", "EU", "GCC"],
    tax: ["UK", "EU"],
    analytics: ["UK", "EU", "GCC"],
    ai: ["UK", "EU", "GCC"],
  };

  return mapping[module.toLowerCase()] || ["UK", "EU", "GCC"];
}
