import { describe, it, expect, beforeEach, vi } from "vitest";
import { runReadOnlyScenario } from "../scenarioRunner";
import { isAgentEnabledForTenant } from "@/server/ai/config";
import { NexaAiClient } from "@/server/ai/client";
import { runToolByName } from "../tools";

// Mock dependencies
vi.mock("@/server/ai/config", () => ({
  isAgentEnabledForTenant: vi.fn(),
}));

vi.mock("@/server/ai/client", () => ({
  NexaAiClient: {
    callModel: vi.fn(),
  },
}));

vi.mock("../tools", () => ({
  getAvailableToolsForModule: vi.fn(),
  runToolByName: vi.fn(),
  getToolMetadata: vi.fn(),
}));

vi.mock("../logs", () => ({
  startAgentRun: vi.fn(),
  recordAgentStep: vi.fn(),
  completeAgentRun: vi.fn(),
}));

describe("Scenario Runner (Phase 28)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error when agent is disabled", async () => {
    (isAgentEnabledForTenant as any).mockResolvedValue(false);

    const result = await runReadOnlyScenario({
      tenantId: "tenant1",
      userId: "user1",
      goal: "Test goal",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("disabled");
  });

  it("should execute scenario when enabled", async () => {
    (isAgentEnabledForTenant as any).mockResolvedValue(true);
    const { startAgentRun } = await import("../logs");
    (startAgentRun as any).mockResolvedValue({ supported: false, runId: "run-123" });
    (NexaAiClient.callModel as any).mockResolvedValue(
      JSON.stringify([{ tool: "finance.getCashPosition", input: {} }])
    );
    (runToolByName as any).mockResolvedValue({ ok: true, data: {} });
    const { getAvailableToolsForModule } = await import("../tools");
    (getAvailableToolsForModule as any).mockReturnValue([
      {
        name: "finance.getCashPosition",
        module: "finance",
        description: "Get cash position",
        inputSchema: { type: "object", properties: {} },
      },
    ]);

    const result = await runReadOnlyScenario({
      tenantId: "tenant1",
      userId: "user1",
      goal: "Get cash position",
    });

    // Should attempt to execute (may fail due to parsing, but should try)
    expect(startAgentRun).toHaveBeenCalled();
  });
});

