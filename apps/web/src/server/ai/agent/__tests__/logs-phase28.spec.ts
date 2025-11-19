import { describe, it, expect, beforeEach, vi } from "vitest";
import { startAgentRun, recordAgentStep, completeAgentRun, getAgentRunsForTenant } from "../logs";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    agentRun: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    agentStep: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("Agent Logs (Phase 28)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startAgentRun", () => {
    it("should return supported:false when schema gap exists", async () => {
      (prisma.agentRun.create as any).mockRejectedValue(new Error("Model not found"));

      const result = await startAgentRun({
        tenantId: "tenant1",
        userId: "user1",
        goal: "Test goal",
      });

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("schema gap");
      expect(result.runId).toBeDefined(); // Should still return transient ID
    });

    it("should persist run when schema supports it", async () => {
      (prisma.agentRun.create as any).mockResolvedValue({
        id: "run-123",
        tenantId: "tenant1",
        userId: "user1",
        goal: "Test goal",
        status: "running",
        startedAt: new Date(),
      });

      const result = await startAgentRun({
        tenantId: "tenant1",
        userId: "user1",
        goal: "Test goal",
      });

      expect(result.supported).toBe(true);
      expect(result.runId).toBe("run-123");
    });
  });

  describe("recordAgentStep", () => {
    it("should return supported:false when schema gap exists", async () => {
      (prisma.agentStep.create as any).mockRejectedValue(new Error("Model not found"));

      const result = await recordAgentStep({
        runId: "run-123",
        toolName: "test.tool",
        input: {},
      });

      expect(result.supported).toBe(false);
      expect(result.reason).toContain("schema gap");
      expect(result.stepId).toBeDefined(); // Should still return transient ID
    });
  });

  describe("getAgentRunsForTenant", () => {
    it("should return supported:false when schema gap exists", async () => {
      (prisma.agentRun.findMany as any).mockRejectedValue(new Error("Model not found"));

      const result = await getAgentRunsForTenant("tenant1");

      expect(result.supported).toBe(false);
      expect(result.runs).toEqual([]);
      expect(result.reason).toContain("schema gap");
    });
  });
});

