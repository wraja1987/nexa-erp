/**
 * Consumer Runner
 * Task 8 Gap Closure: Full DB-backed outbox processing
 */

import { publishEvent } from "./bus";
import { fetchPendingOutboxBatch, markOutboxEventProcessed } from "./outboxRepository";
import { recordEventMetric } from "./metrics";
import type { NexaEvent } from "./types";

export type ConsumerRunResult = {
  supported: boolean;
  processed: number;
  failed: number;
  remaining?: number;
  reason?: string;
};

/**
 * Process outbox batch (replay pending events).
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function processOutboxBatch(options: {
  limit?: number;
  type?: string;
  tenantId?: string;
  since?: Date;
}): Promise<ConsumerRunResult> {
  try {
    const limit = options.limit || 100;

    // Fetch pending events
    const batch = await fetchPendingOutboxBatch(limit, {
      type: options.type,
      tenantId: options.tenantId,
      since: options.since,
    });

    if (!batch.supported) {
      return {
        supported: false,
        processed: 0,
        failed: 0,
        reason: batch.reason,
      };
    }

    if (batch.events.length === 0) {
      return {
        supported: true,
        processed: 0,
        failed: 0,
        remaining: 0,
      };
    }

    let processed = 0;
    let failed = 0;

    // Process each event (idempotent handlers)
    for (const { id, event } of batch.events) {
      try {
        // Re-publish event (handlers must be idempotent)
        await publishEvent(event);

        // Mark as processed
        await markOutboxEventProcessed(id, "success");

        // Record metric
        try {
          await recordEventMetric(event, "replayed");
        } catch (error) {
          // Ignore metric errors
        }

        processed++;
      } catch (error: any) {
        // Mark as failed
        await markOutboxEventProcessed(id, "failed", error?.message || String(error));

        // Record metric
        try {
          await recordEventMetric(event, "failed");
        } catch (metricError) {
          // Ignore metric errors
        }

        failed++;
      }
    }

    // Check remaining count
    const remainingBatch = await fetchPendingOutboxBatch(1, {
      type: options.type,
      tenantId: options.tenantId,
      since: options.since,
    });

    return {
      supported: true,
      processed,
      failed,
      remaining: remainingBatch.supported ? remainingBatch.events.length : undefined,
    };
  } catch (e: any) {
    return {
      supported: false,
      processed: 0,
      failed: 0,
      reason: `Failed to process outbox batch: ${e?.message || "unknown"}`,
    };
  }
}

/**
 * Run outbox consumers once (process a batch of pending events).
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function runOutboxConsumersOnce(limit: number = 100): Promise<ConsumerRunResult> {
  return processOutboxBatch({ limit });
}

/**
 * Replay specific events by IDs.
 * Task 8 Gap Closure: Full DB-backed implementation
 */
export async function replayOutboxEvents(ids: string[]): Promise<ConsumerRunResult> {
  try {
    let processed = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        // Fetch the event from outbox
        const { getOutboxEvent } = await import("./outboxRepository");
        const eventResult = await getOutboxEvent(id);

        if (!eventResult.supported || !eventResult.event) {
          failed++;
          continue;
        }

        // Reconstruct NexaEvent
        const event: NexaEvent = {
          id: eventResult.event.id,
          tenantId: eventResult.event.tenantId,
          type: eventResult.event.type as any,
          occurredAt: eventResult.event.createdAt.toISOString(),
          source: "outbox",
          version: 1,
          payload: eventResult.event.payload,
        };

        // Re-publish event
        await publishEvent(event);

        // Mark as processed
        await markOutboxEventProcessed(id, "success");

        processed++;
      } catch (error: any) {
        await markOutboxEventProcessed(id, "failed", error?.message || String(error));
        failed++;
      }
    }

    return {
      supported: true,
      processed,
      failed,
    };
  } catch (e: any) {
    return {
      supported: false,
      processed: 0,
      failed: 0,
      reason: `Failed to replay events: ${e?.message || "unknown"}`,
    };
  }
}
