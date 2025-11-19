/**
 * Event Metrics and Observability
 * Records event metrics using existing telemetry infrastructure.
 */

import * as Sentry from "@sentry/nextjs";
import { incMetric } from "@/lib/observability/metrics";
import type { NexaEvent } from "./types";

export type EventOutcome = "published" | "failed" | "replayed";

/**
 * Record event metric.
 * Uses existing telemetry/metrics tooling (Sentry, metrics, logs).
 */
export async function recordEventMetric(event: NexaEvent, outcome: EventOutcome): Promise<void> {
  try {
    // Record to metrics (Redis-based)
    await incMetric("event", {
      type: event.type,
      outcome,
      tenantId: event.tenantId,
    });

    // Log to console (non-PII)
    console.log(`[EventMetrics] ${event.type} ${outcome}`, {
      eventId: event.id,
      tenantId: event.tenantId,
      source: event.source,
      outcome,
    });

    // Report to Sentry if available (for failures)
    if (outcome === "failed" && typeof Sentry !== "undefined" && Sentry.captureMessage) {
      Sentry.captureMessage(`Event ${outcome}`, {
        level: "warning",
        tags: {
          eventType: event.type,
          tenantId: event.tenantId,
        },
        extra: {
          eventId: event.id,
          source: event.source,
        },
      });
    }
  } catch (error) {
    // Swallow errors in metrics recording
    console.warn(`[EventMetrics] Failed to record metric:`, error);
  }
}

