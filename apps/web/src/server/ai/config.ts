export const AI_ENGINE_ENABLED = process.env.AI_ENGINE_ENABLED !== "false";

// Agent feature flags (Phase 28) - default OFF
export const AGENT_ENABLED = process.env.AGENT_ENABLED === "true";
export const AGENT_FINANCE_ENABLED = process.env.AGENT_FINANCE_ENABLED === "true";
export const AGENT_INVENTORY_ENABLED = process.env.AGENT_INVENTORY_ENABLED === "true";
export const AGENT_PLANNING_ENABLED = process.env.AGENT_PLANNING_ENABLED === "true";
export const AGENT_ANALYTICS_ENABLED = process.env.AGENT_ANALYTICS_ENABLED === "true";

/**
 * Check if agent is enabled for tenant and module
 * Returns false if global flag is off or per-tenant config disables it
 */
export async function isAgentEnabledForTenant(
  tenantId: string,
  module?: string
): Promise<boolean> {
  // Global flag must be enabled
  if (!AGENT_ENABLED) {
    return false;
  }

  // Check per-module flags if specified
  if (module) {
    if (module === "finance" && !AGENT_FINANCE_ENABLED) return false;
    if (module === "inventory" && !AGENT_INVENTORY_ENABLED) return false;
    if (module === "planning" && !AGENT_PLANNING_ENABLED) return false;
    if (module === "analytics" && !AGENT_ANALYTICS_ENABLED) return false;
  }

  // TODO: Check per-tenant config if AgentConfig model exists (schema gap)
  // For now, default to global flag only

  return true;
}


