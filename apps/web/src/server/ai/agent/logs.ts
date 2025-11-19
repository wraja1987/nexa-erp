/**
 * Phase 28 — Agent Run and Step Logs
 * Task 8 Gap Closure: Full DB-backed implementation using AgentRun and AgentStep models
 */

import { prisma } from "@/lib/prisma";

export interface AgentRunRecord {
  id: string;
  tenantId: string;
  userId: string;
  goal: string;
  module?: string;
  status: "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface AgentStepRecord {
  id: string;
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Start an agent run
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function startAgentRun(params: {
  tenantId: string;
  userId: string;
  goal: string;
  module?: string;
  flags?: Record<string, unknown>;
}): Promise<{ supported: boolean; runId: string; reason?: string }> {
  try {
    const run = await prisma.agentRun.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        goal: params.goal,
        module: params.module || null,
        status: "running",
      },
    });

    return {
      supported: true,
      runId: run.id,
    };
  } catch (error: any) {
    return {
      supported: false,
      runId: "",
      reason: `Failed to start agent run: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Record an agent step
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function recordAgentStep(params: {
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}): Promise<{ supported: boolean; stepId: string; reason?: string }> {
  try {
    const step = await prisma.agentStep.create({
      data: {
        runId: params.runId,
        toolName: params.toolName,
        input: params.input as any,
        output: params.output as any,
        error: params.error || null,
        completedAt: params.error || params.output ? new Date() : null,
      },
    });

    return {
      supported: true,
      stepId: step.id,
    };
  } catch (error: any) {
    return {
      supported: false,
      stepId: "",
      reason: `Failed to record agent step: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Complete an agent run
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function completeAgentRun(params: {
  runId: string;
  status: "completed" | "failed";
  error?: string;
}): Promise<{ supported: boolean; reason?: string }> {
  try {
    await prisma.agentRun.update({
      where: { id: params.runId },
      data: {
        status: params.status,
        completedAt: new Date(),
        error: params.error || null,
      },
    });

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to complete agent run: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Get agent runs for tenant
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function getAgentRunsForTenant(
  tenantId: string,
  limit: number = 50
): Promise<{ supported: boolean; runs: AgentRunRecord[]; reason?: string }> {
  try {
    const runs = await prisma.agentRun.findMany({
      where: { tenantId },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return {
      supported: true,
      runs: runs.map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        userId: r.userId,
        goal: r.goal,
        module: r.module || undefined,
        status: r.status as any,
        startedAt: r.startedAt,
        completedAt: r.completedAt || undefined,
        error: r.error || undefined,
      })),
    };
  } catch (error: any) {
    return {
      supported: false,
      runs: [],
      reason: `Failed to get agent runs: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Get agent steps for a run
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function getAgentStepsForRun(
  runId: string
): Promise<{ supported: boolean; steps: AgentStepRecord[]; reason?: string }> {
  try {
    const steps = await prisma.agentStep.findMany({
      where: { runId },
      orderBy: { startedAt: "asc" },
    });

    return {
      supported: true,
      steps: steps.map((s) => ({
        id: s.id,
        runId: s.runId,
        toolName: s.toolName,
        input: s.input as any,
        output: s.output as any,
        error: s.error || undefined,
        startedAt: s.startedAt,
        completedAt: s.completedAt || undefined,
      })),
    };
  } catch (error: any) {
    return {
      supported: false,
      steps: [],
      reason: `Failed to get agent steps: ${error?.message || "unknown"}`,
    };
  }
}
