/**
 * Outbox Repository
 * Task 8 Gap Closure: Full DB-backed implementation using OutboxEvent model
 */

import { prisma } from "@/lib/prisma";
import type { NexaEvent } from "./types";

export interface OutboxSupport {
  supported: boolean;
  reason?: string;
}

/**
 * Check if outbox functionality is supported.
 * Task 8 Gap Closure: Always returns true - OutboxEvent model exists
 */
export async function getOutboxSupport(): Promise<OutboxSupport> {
  return { supported: true };
}

/**
 * Enqueue event to outbox.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function enqueueOutboxEvent(event: NexaEvent): Promise<OutboxSupport> {
  try {
    await prisma.outboxEvent.create({
      data: {
        tenantId: event.tenantId,
        type: event.type,
        payload: event.payload as any,
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        nextAttemptAt: new Date(),
      },
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      reason: `Failed to enqueue event: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Fetch pending outbox events batch.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function fetchPendingOutboxBatch(
  limit: number,
  options?: { type?: string; tenantId?: string; since?: Date }
): Promise<{
  supported: boolean;
  events: Array<{ id: string; event: NexaEvent }>;
  reason?: string;
}> {
  try {
    const where: any = {
      status: "pending",
      OR: [
        { nextAttemptAt: null },
        { nextAttemptAt: { lte: new Date() } },
      ],
    };

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.tenantId) {
      where.tenantId = options.tenantId;
    }

    if (options?.since) {
      where.createdAt = { gte: options.since };
    }

    const records = await prisma.outboxEvent.findMany({
      where,
      orderBy: [{ createdAt: "asc" }],
      take: limit,
    });

    // Convert to NexaEvent format
    const events = records.map((r) => {
      const event: NexaEvent = {
        id: r.id,
        tenantId: r.tenantId,
        type: r.type as any,
        occurredAt: r.createdAt.toISOString(),
        source: "outbox",
        version: 1,
        payload: r.payload as any,
      };

      return {
        id: r.id,
        event,
      };
    });

    return {
      supported: true,
      events,
    };
  } catch (e: any) {
    return {
      supported: false,
      events: [],
      reason: `Failed to fetch outbox batch: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Mark outbox event as processed.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function markOutboxEventProcessed(
  id: string,
  status: "success" | "failed",
  errorMessage?: string
): Promise<OutboxSupport> {
  try {
    const updateData: any = {
      attempts: { increment: 1 },
    };

    if (status === "success") {
      updateData.status = "published";
      updateData.publishedAt = new Date();
      updateData.nextAttemptAt = null;
      updateData.error = null;
    } else {
      // Check if max attempts reached
      const event = await prisma.outboxEvent.findUnique({
        where: { id },
        select: { attempts: true, maxAttempts: true },
      });

      if (event && event.attempts + 1 >= event.maxAttempts) {
        updateData.status = "failed";
        updateData.error = errorMessage || "Max attempts reached";
        updateData.nextAttemptAt = null;
      } else {
        // Retry with exponential backoff
        const delayMs = Math.min(60000 * Math.pow(2, event?.attempts || 0), 3600000); // Max 1 hour
        updateData.status = "pending";
        updateData.nextAttemptAt = new Date(Date.now() + delayMs);
        updateData.error = errorMessage || undefined;
      }
    }

    await prisma.outboxEvent.update({
      where: { id },
      data: updateData,
    });

    return { supported: true };
  } catch (e: any) {
    return {
      supported: false,
      reason: `Failed to mark event processed: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Get outbox event by ID.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function getOutboxEvent(id: string): Promise<{
  supported: boolean;
  event: {
    id: string;
    tenantId: string;
    type: string;
    payload: any;
    status: string;
    attempts: number;
    error?: string;
    createdAt: Date;
    publishedAt?: Date;
  } | null;
  reason?: string;
}> {
  try {
    const record = await prisma.outboxEvent.findUnique({
      where: { id },
    });

    if (!record) {
      return {
        supported: true,
        event: null,
      };
    }

    return {
      supported: true,
      event: {
        id: record.id,
        tenantId: record.tenantId,
        type: record.type,
        payload: record.payload,
        status: record.status,
        attempts: record.attempts,
        error: record.error || undefined,
        createdAt: record.createdAt,
        publishedAt: record.publishedAt || undefined,
      },
    };
  } catch (e: any) {
    return {
      supported: false,
      event: null,
      reason: `Failed to get outbox event: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * List outbox events with filters.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function listOutboxEvents(options: {
  tenantId?: string;
  type?: string;
  status?: string;
  since?: Date;
  limit?: number;
  offset?: number;
}): Promise<{
  supported: boolean;
  events: Array<{
    id: string;
    tenantId: string;
    type: string;
    status: string;
    attempts: number;
    error?: string;
    createdAt: Date;
    publishedAt?: Date;
  }>;
  total?: number;
  reason?: string;
}> {
  try {
    const where: any = {};

    if (options.tenantId) {
      where.tenantId = options.tenantId;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.since) {
      where.createdAt = { gte: options.since };
    }

    const [events, total] = await Promise.all([
      prisma.outboxEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options.limit || 100,
        skip: options.offset || 0,
        select: {
          id: true,
          tenantId: true,
          type: true,
          status: true,
          attempts: true,
          error: true,
          createdAt: true,
          publishedAt: true,
        },
      }),
      prisma.outboxEvent.count({ where }),
    ]);

    return {
      supported: true,
      events: events.map((e) => ({
        id: e.id,
        tenantId: e.tenantId,
        type: e.type,
        status: e.status,
        attempts: e.attempts,
        error: e.error || undefined,
        createdAt: e.createdAt,
        publishedAt: e.publishedAt || undefined,
      })),
      total,
    };
  } catch (e: any) {
    return {
      supported: false,
      events: [],
      reason: `Failed to list outbox events: ${e?.message || "unknown"}`,
    };
  }
}
