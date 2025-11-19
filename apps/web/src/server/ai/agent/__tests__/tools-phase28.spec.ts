import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerTool, getAvailableToolsForModule, runToolByName, getToolMetadata } from "../tools";
import { prisma } from "@/lib/prisma";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    customerInvoice: {
      findMany: vi.fn(),
    },
    inventoryItem: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/banking/cash", () => ({
  getCashPosition: vi.fn(),
}));

vi.mock("@/server/planning/service", () => ({
  getDemandPlan: vi.fn(),
  getRecommendations: vi.fn(),
}));

vi.mock("@/server/analytics/kpi", () => ({
  getAllKpis: vi.fn(),
}));

describe("Agent Tools (Phase 28)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tool Registry", () => {
    it("should register read-only tools", () => {
      const financeTools = getAvailableToolsForModule("finance");
      expect(financeTools.length).toBeGreaterThan(0);
      financeTools.forEach((tool) => {
        expect(tool.readOnly).toBe(true);
      });
    });

    it("should reject non-read-only tools", () => {
      expect(() => {
        registerTool({
          name: "test.write",
          module: "test",
          description: "Test write tool",
          inputSchema: { type: "object", properties: {} },
          readOnly: false, // Should fail
          async run() {
            return { ok: true };
          },
        });
      }).toThrow();
    });
  });

  describe("Tool Execution", () => {
    it("should execute read-only tools", async () => {
      const { getCashPosition } = await import("@/server/banking/cash");
      (getCashPosition as any).mockResolvedValue({ asOf: new Date().toISOString(), rows: [] });

      const result = await runToolByName(
        "finance.getCashPosition",
        {
          tenantId: "tenant1",
          userId: "user1",
        },
        {}
      );

      expect(result.ok).toBe(true);
      expect(getCashPosition).toHaveBeenCalled();
    });

    it("should return error for non-existent tool", async () => {
      const result = await runToolByName(
        "nonexistent.tool",
        {
          tenantId: "tenant1",
          userId: "user1",
        },
        {}
      );

      expect(result.ok).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should require tenantId in context", async () => {
      const result = await runToolByName(
        "finance.getCashPosition",
        {
          tenantId: "",
          userId: "user1",
        } as any,
        {}
      );

      expect(result.ok).toBe(false);
      expect(result.error).toContain("tenantId");
    });
  });

  describe("Tool Metadata", () => {
    it("should return tool metadata", () => {
      const tool = getToolMetadata("finance.getCashPosition");
      expect(tool).toBeDefined();
      expect(tool?.name).toBe("finance.getCashPosition");
      expect(tool?.readOnly).toBe(true);
    });

    it("should return null for non-existent tool", () => {
      const tool = getToolMetadata("nonexistent.tool");
      expect(tool).toBeNull();
    });
  });
});

