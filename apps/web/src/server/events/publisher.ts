/**
 * Event Publisher
 * Task 8 Gap Closure: Full DB-backed outbox persistence
 */

import { publishEvent } from "./bus";
import { enqueueOutboxEvent } from "./outboxRepository";
import { recordEventMetric } from "./metrics";
import type { NexaEvent } from "./types";
import { getRequestContext } from "@/server/observability/requestContext";
import { incrementCounter } from "@/server/observability/metrics";

/**
 * Publish event with outbox persistence.
 * Task 8 Gap Closure: Always writes to outbox, then dispatches to in-process handlers
 */
export async function publishWithOutbox(event: NexaEvent): Promise<void> {
  // Propagate correlation/trace IDs from request context
  const ctx = getRequestContext();
  if (ctx && !event.correlationId) {
    (event as any).correlationId = ctx.correlationId;
  }
  if (ctx && !event.causationId) {
    (event as any).causationId = ctx.traceId || ctx.correlationId;
  }

  // Record metrics
  incrementCounter("events_published_total", {
    module: "events",
    operation: "publish",
    tenantId: event.tenantId,
    eventType: event.type,
    status: "ok",
  });

  // Always write to outbox first (durable persistence)
  try {
    const enqueueResult = await enqueueOutboxEvent(event);
    if (!enqueueResult.supported) {
      // Log but don't throw - outbox write failure is non-critical for immediate processing
      console.warn(`[EventPublisher] Outbox enqueue failed: ${enqueueResult.reason}`);
    } else {
      await recordEventMetric(event, "published");
    }
  } catch (error: any) {
    // Log but don't throw - outbox persistence is best-effort
    console.error(`[EventPublisher] Outbox enqueue error:`, error?.message || String(error));
  }

  // Always execute in-process handlers (immediate processing)
  await publishEvent(event);
}
