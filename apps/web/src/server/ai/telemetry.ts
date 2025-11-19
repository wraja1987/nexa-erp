export interface AiCallTelemetry {
  tenantId: string;
  module: string;
  task: string;
  model?: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
  // Agent-level metadata (Phase 28)
  agentRunId?: string;
  agentStepId?: string;
  toolName?: string;
}

export function recordAiTelemetry(data: AiCallTelemetry): void {
  // Best-effort logging only; no DB writes
  try {
    // eslint-disable-next-line no-console
    console.log("[AI]", JSON.stringify({ level: "info", ...data }));
  } catch {
    // noop
  }
}


