/**
 * Phase 28 — Read-Only Scenario Runner
 *
 * Internal read-only scenario execution. Admin/internal use only.
 */

import { NexaAiClient } from "@/server/ai/client";
import { getAvailableToolsForModule, runToolByName, getToolMetadata } from "./tools";
import { startAgentRun, recordAgentStep, completeAgentRun } from "./logs";
import { AGENT_TOOL_SELECTION_PROMPT, AGENT_PLAN_SYNTHESIS_PROMPT } from "@/server/ai/prompts/agents";
import { isAgentEnabledForTenant } from "@/server/ai/config";
import type { AgentToolContext } from "./tools";

export interface ScenarioResult {
  ok: boolean;
  runId: string;
  goal: string;
  analysis?: {
    summary: string;
    insights: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  toolResults?: Array<{
    toolName: string;
    input: Record<string, unknown>;
    output: unknown;
    error?: string;
  }>;
  error?: string;
}

/**
 * Run a read-only scenario
 */
export async function runReadOnlyScenario(params: {
  tenantId: string;
  userId: string;
  goal: string;
  modules?: string[];
}): Promise<ScenarioResult> {
  // Check if agent is enabled
  const enabled = await isAgentEnabledForTenant(params.tenantId, params.modules?.[0]);
  if (!enabled) {
    return {
      ok: false,
      runId: "",
      goal: params.goal,
      error: "Agent features are disabled. Set AGENT_ENABLED=true and module flags to enable.",
    };
  }

  // Start agent run
  const runResult = await startAgentRun({
    tenantId: params.tenantId,
    userId: params.userId,
    goal: params.goal,
    module: params.modules?.[0],
  });

  const runId = runResult.runId;

  try {
    // Get available tools for modules
    const availableTools = params.modules
      ? params.modules.flatMap((m) => getAvailableToolsForModule(m))
      : getAvailableToolsForModule();

    // Build tool list for prompt
    const toolList = availableTools.map((t) => ({
      name: t.name,
      module: t.module,
      description: t.description,
      inputSchema: t.inputSchema,
    }));

    // Use AI to select tools
    const toolSelectionPrompt = AGENT_TOOL_SELECTION_PROMPT.replace(
      "{tools}",
      JSON.stringify(toolList, null, 2)
    ).replace("{goal}", params.goal);

    const toolSelectionResponse = await NexaAiClient.callModel(toolSelectionPrompt, {
      tenantId: params.tenantId,
      module: params.modules?.[0] || "agent",
      task: "tool_selection",
      agentRunId: runId,
    });

    // Parse tool selection (simplified - in production would use structured output)
    let toolCalls: Array<{ tool: string; input: Record<string, unknown> }> = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = toolSelectionResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        toolCalls = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, use a simple heuristic or default
      // For now, return error
      return {
        ok: false,
        runId,
        goal: params.goal,
        error: "Failed to parse tool selection from AI response",
      };
    }

    // Execute tools
    const toolResults: ScenarioResult["toolResults"] = [];
    const context: AgentToolContext = {
      tenantId: params.tenantId,
      userId: params.userId,
      module: params.modules?.[0],
      correlationId: runId,
    };

    for (const toolCall of toolCalls) {
      // Validate tool exists
      const tool = getToolMetadata(toolCall.tool);
      if (!tool) {
        toolResults.push({
          toolName: toolCall.tool,
          input: toolCall.input,
          output: null,
          error: `Tool ${toolCall.tool} not found`,
        });
        continue;
      }

      // Record step start
      const stepResult = await recordAgentStep({
        runId,
        toolName: toolCall.tool,
        input: toolCall.input,
      });

      // Execute tool
      const toolOutput = await runToolByName(toolCall.tool, context, toolCall.input);

      // Record step completion
      await recordAgentStep({
        runId,
        toolName: toolCall.tool,
        input: toolCall.input,
        output: toolOutput.ok ? (toolOutput.data as Record<string, unknown>) : undefined,
        error: toolOutput.error,
      });

      toolResults.push({
        toolName: toolCall.tool,
        input: toolCall.input,
        output: toolOutput.data,
        error: toolOutput.error,
      });
    }

    // Synthesize results
    const synthesisPrompt = AGENT_PLAN_SYNTHESIS_PROMPT.replace(
      "{results}",
      JSON.stringify(toolResults, null, 2)
    ).replace("{goal}", params.goal);

    const synthesisResponse = await NexaAiClient.callModel(synthesisPrompt, {
      tenantId: params.tenantId,
      module: params.modules?.[0] || "agent",
      task: "plan_synthesis",
      agentRunId: runId,
    });

    // Parse synthesis (simplified - in production would use structured output)
    let analysis: ScenarioResult["analysis"];
    try {
      // Try to extract structured analysis from response
      // For now, use a simple structure
      analysis = {
        summary: synthesisResponse.slice(0, 500),
        insights: [],
        recommendations: [],
        nextSteps: [],
      };
    } catch {
      analysis = {
        summary: synthesisResponse,
        insights: [],
        recommendations: [],
        nextSteps: [],
      };
    }

    // Complete run
    await completeAgentRun({
      runId,
      status: "completed",
    });

    return {
      ok: true,
      runId,
      goal: params.goal,
      analysis,
      toolResults,
    };
  } catch (error: any) {
    // Complete run with error
    await completeAgentRun({
      runId,
      status: "failed",
      error: error?.message || "Unknown error",
    });

    return {
      ok: false,
      runId,
      goal: params.goal,
      error: error?.message || "Scenario execution failed",
    };
  }
}

