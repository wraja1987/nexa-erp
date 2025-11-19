import { recordAiTelemetry } from "@/server/ai/telemetry";

export type NexaAiModel = "default" | "cheap" | "analysis";
export interface NexaAiCallOptions {
  model?: NexaAiModel;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  tenantId?: string;
  module?: string;
  task?: string;
  // Agent-level metadata (Phase 28)
  agentRunId?: string;
  agentStepId?: string;
  toolName?: string;
}

export class NexaAiClient {
  static async callModel(prompt: string, options?: NexaAiCallOptions): Promise<string> {
    const started = Date.now();
    const model = options?.model || "default";
    const tenantId = options?.tenantId || "unknown";
    const module = options?.module || "generic";
    const task = options?.task || "generic";

    try {
      // If no provider key, return a deterministic stub without external calls
      const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY?.trim();
      if (!key) {
        const out = `[stub:${model}] ${prompt.slice(0, 160)} ...`;
        recordAiTelemetry({
          tenantId,
          module,
          task,
          model,
          latencyMs: Date.now() - started,
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: Math.ceil(out.length / 4),
        });
        return out;
      }
      // Real provider call would go here; keep read-only behaviour and do not mutate
      // Network calls are intentionally omitted; return a safe echo with limited size
      const out = `[echo:${model}] ${prompt.slice(0, 400)} ...`;
      recordAiTelemetry({
        tenantId,
        module,
        task,
        model,
        latencyMs: Date.now() - started,
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(out.length / 4),
      });
      return out;
    } catch (err: any) {
      recordAiTelemetry({
        tenantId,
        module,
        task,
        model,
        latencyMs: Date.now() - started,
        error: String(err?.message || err),
      });
      throw err;
    }
  }
}


