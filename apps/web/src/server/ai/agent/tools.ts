/**
 * Phase 28 — Read-Only Tool Registry
 *
 * Central registry of read-only tools per module. All tools must be strictly read-only.
 */

import { assertTenantScope } from "@/lib/auth/tenant.server";
import { getCashPosition } from "@/server/banking/cash";
import { getReconciliationSuggestions } from "@/server/ai/tasks/financeReconciliation";
import { getDemandPlan, getSupplyPlan, getRecommendations, getCapacityView } from "@/server/planning/service";
import { getAllKpis } from "@/server/analytics/kpi";
import { prisma } from "@/lib/prisma";

export interface AgentToolContext {
  tenantId: string;
  userId: string;
  module?: string;
  correlationId?: string;
}

export type AgentToolInput = Record<string, unknown>;
export type AgentToolOutput = {
  ok: boolean;
  data?: unknown;
  error?: string;
};

export interface AgentTool {
  name: string;
  module: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string; required?: boolean }>;
    required?: string[];
  };
  run: (context: AgentToolContext, input: AgentToolInput) => Promise<AgentToolOutput>;
  readOnly: true; // Enforced at registration
}

// Tool registry
const tools = new Map<string, AgentTool>();

/**
 * Register a read-only tool
 */
export function registerTool(tool: AgentTool): void {
  if (!tool.readOnly) {
    throw new Error(`Tool ${tool.name} must be read-only`);
  }
  tools.set(tool.name, tool);
}

// Finance Tools
registerTool({
  name: "finance.getCashPosition",
  module: "finance",
  description: "Get current cash position across all bank accounts",
  inputSchema: {
    type: "object",
    properties: {
      asOf: { type: "string", description: "Date (ISO string) to get cash position as of", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const asOf = input.asOf ? new Date(String(input.asOf)) : new Date();
      const data = await getCashPosition({ tenantId: context.tenantId }, asOf);
      return { ok: true, data };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get cash position" };
    }
  },
});

registerTool({
  name: "finance.getOutstandingInvoices",
  module: "finance",
  description: "Get outstanding customer invoices",
  inputSchema: {
    type: "object",
    properties: {
      limit: { type: "number", description: "Maximum number of invoices to return", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const limit = input.limit ? Number(input.limit) : 50;
      const invoices = await prisma.customerInvoice.findMany({
        where: {
          tenantId: context.tenantId,
          status: { not: "paid" },
        },
        take: limit,
        orderBy: { dueAt: "asc" },
        select: {
          id: true,
          number: true,
          customerId: true,
          total: true,
          currency: true,
          dueAt: true,
          status: true,
        },
      });
      return { ok: true, data: invoices };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get outstanding invoices" };
    }
  },
});

registerTool({
  name: "finance.getReconciliationSuggestions",
  module: "finance",
  description: "Get AI-powered reconciliation suggestions",
  inputSchema: {
    type: "object",
    properties: {
      limit: { type: "number", description: "Maximum number of suggestions", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const limit = input.limit ? Number(input.limit) : 10;
      const suggestions = await getReconciliationSuggestions(
        { tenantId: context.tenantId },
        { limit }
      );
      return { ok: true, data: suggestions };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get reconciliation suggestions" };
    }
  },
});

// Inventory Tools
registerTool({
  name: "inventory.getLowStockItems",
  module: "inventory",
  description: "Get items below reorder point or low stock",
  inputSchema: {
    type: "object",
    properties: {
      warehouseId: { type: "string", description: "Filter by warehouse ID", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const where: any = {
        tenantId: context.tenantId,
      };
      if (input.warehouseId) {
        where.warehouseId = String(input.warehouseId);
      }
      // Simplified: get items with low qtyOnHand (would need reorderPoint field for real check)
      const items = await prisma.inventoryItem.findMany({
        where: {
          ...where,
          qtyOnHand: { lt: 10 }, // Naive threshold
        },
        take: 50,
        select: {
          id: true,
          sku: true,
          name: true,
          qtyOnHand: true,
          warehouseId: true,
        },
      });
      return { ok: true, data: items };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get low stock items" };
    }
  },
});

// Planning Tools (Phase 26)
registerTool({
  name: "planning.getDemandPlan",
  module: "planning",
  description: "Get demand plan for planning horizon",
  inputSchema: {
    type: "object",
    properties: {
      horizonMonths: { type: "number", description: "Planning horizon in months", required: false },
      bucketSize: { type: "string", description: "Bucket size: 'week' or 'month'", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const result = await getDemandPlan(context.tenantId, {
        horizonMonths: input.horizonMonths ? Number(input.horizonMonths) : 3,
        bucketSize: input.bucketSize as "week" | "month" | undefined,
      });
      if (!result.supported) {
        return { ok: false, error: result.reason || "Demand planning not supported" };
      }
      return { ok: true, data: result.plan };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get demand plan" };
    }
  },
});

registerTool({
  name: "planning.getRecommendations",
  module: "planning",
  description: "Get planning recommendations (suggested POs, WOs, transfers)",
  inputSchema: {
    type: "object",
    properties: {
      horizonMonths: { type: "number", description: "Planning horizon in months", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const result = await getRecommendations(context.tenantId, {
        horizonMonths: input.horizonMonths ? Number(input.horizonMonths) : 3,
      });
      if (!result.supported) {
        return { ok: false, error: result.reason || "Planning recommendations not supported" };
      }
      return { ok: true, data: result.recommendations };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get recommendations" };
    }
  },
});

// Analytics Tools
registerTool({
  name: "analytics.getKpis",
  module: "analytics",
  description: "Get KPIs for all modules",
  inputSchema: {
    type: "object",
    properties: {
      module: { type: "string", description: "Filter by module (optional)", required: false },
    },
  },
  readOnly: true,
  async run(context, input) {
    try {
      const kpis = await getAllKpis({ tenantId: context.tenantId });
      if (input.module) {
        const moduleKpis = (kpis as any)[String(input.module)];
        return { ok: true, data: moduleKpis || {} };
      }
      return { ok: true, data: kpis };
    } catch (error: any) {
      return { ok: false, error: error?.message || "Failed to get KPIs" };
    }
  },
});

/**
 * Get available tools for a module
 */
export function getAvailableToolsForModule(module?: string): AgentTool[] {
  if (module) {
    return Array.from(tools.values()).filter((t) => t.module === module);
  }
  return Array.from(tools.values());
}

/**
 * Run a tool by name
 */
export async function runToolByName(
  toolName: string,
  context: AgentToolContext,
  input: AgentToolInput
): Promise<AgentToolOutput> {
  const tool = tools.get(toolName);
  if (!tool) {
    return { ok: false, error: `Tool ${toolName} not found` };
  }

  // Ensure tool is read-only (double-check)
  if (!tool.readOnly) {
    return { ok: false, error: `Tool ${toolName} is not read-only` };
  }

  // Validate context has tenantId
  if (!context.tenantId) {
    return { ok: false, error: "Missing tenantId in context" };
  }

  try {
    return await tool.run(context, input);
  } catch (error: any) {
    return { ok: false, error: error?.message || `Tool ${toolName} execution failed` };
  }
}

/**
 * Get tool metadata (for UI and scenario runner)
 */
export function getToolMetadata(toolName: string): AgentTool | null {
  return tools.get(toolName) || null;
}

