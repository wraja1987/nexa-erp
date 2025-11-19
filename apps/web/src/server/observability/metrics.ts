/**
 * Metrics Layer
 * Centralized metric recording for key flows.
 * Degrades cleanly when metrics backend is unconfigured.
 */

import { incMetric } from "@/lib/observability/metrics";
import { getRequestContext } from "./requestContext";

const METRICS_ENABLED = process.env.NEXA_METRICS_ENABLED === "true";
const METRICS_PROVIDER = (process.env.NEXA_METRICS_PROVIDER || "none") as
  | "prometheus"
  | "datadog"
  | "redis"
  | "none";

export type MetricModule =
  | "finance"
  | "inventory"
  | "manufacturing"
  | "purchasing"
  | "hr"
  | "payroll"
  | "banking"
  | "pos"
  | "tax"
  | "analytics"
  | "ai"
  | "events"
  | "imports";

export interface MetricTags {
  tenantId?: string;
  module?: MetricModule;
  operation?: string;
  status?: "ok" | "error";
  [key: string]: string | number | undefined;
}

/**
 * Increment a counter metric.
 * No-op when metrics are disabled.
 */
export function incrementCounter(name: string, tags?: MetricTags): void {
  if (!METRICS_ENABLED) {
    return;
  }

  try {
    // Get tenant/user from request context if available
    const ctx = getRequestContext();
    const enrichedTags: Record<string, string | number> = {
      ...tags,
      tenantId: tags?.tenantId || ctx?.tenantId || "unknown",
      userId: ctx?.userId || "unknown",
      correlationId: ctx?.correlationId || "unknown",
    };

    // Remove undefined values
    Object.keys(enrichedTags).forEach((key) => {
      if (enrichedTags[key] === undefined) {
        delete enrichedTags[key];
      }
    });

    // Use existing Redis-based metrics if provider is redis or none
    if (METRICS_PROVIDER === "redis" || METRICS_PROVIDER === "none") {
      incMetric(name, enrichedTags).catch(() => {
        // Swallow errors in metrics recording
      });
    } else {
      // TODO: Integrate with Prometheus/Datadog SDK when backend is configured
      // For now, log that metrics would be recorded
      console.debug(`[Metrics] Counter: ${name}`, enrichedTags);
    }
  } catch (error) {
    // Swallow errors in metrics recording
    console.debug(`[Metrics] Failed to record counter ${name}:`, error);
  }
}

/**
 * Record a duration metric (in milliseconds).
 * No-op when metrics are disabled.
 */
export function recordDuration(name: string, ms: number, tags?: MetricTags): void {
  if (!METRICS_ENABLED) {
    return;
  }

  try {
    // Get tenant/user from request context if available
    const ctx = getRequestContext();
    const enrichedTags: Record<string, string | number> = {
      ...tags,
      duration_ms: ms,
      tenantId: tags?.tenantId || ctx?.tenantId || "unknown",
      userId: ctx?.userId || "unknown",
      correlationId: ctx?.correlationId || "unknown",
    };

    // Remove undefined values
    Object.keys(enrichedTags).forEach((key) => {
      if (enrichedTags[key] === undefined) {
        delete enrichedTags[key];
      }
    });

    // Use existing Redis-based metrics if provider is redis or none
    if (METRICS_PROVIDER === "redis" || METRICS_PROVIDER === "none") {
      // Record duration as a counter with duration_ms tag
      incMetric(`${name}_total`, enrichedTags).catch(() => {
        // Swallow errors
      });
    } else {
      // TODO: Integrate with Prometheus/Datadog SDK when backend is configured
      // For now, log that metrics would be recorded
      console.debug(`[Metrics] Duration: ${name} = ${ms}ms`, enrichedTags);
    }
  } catch (error) {
    // Swallow errors in metrics recording
    console.debug(`[Metrics] Failed to record duration ${name}:`, error);
  }
}

/**
 * Record a gauge metric (current value).
 * No-op when metrics are disabled.
 */
export function recordGauge(name: string, value: number, tags?: MetricTags): void {
  if (!METRICS_ENABLED) {
    return;
  }

  try {
    const ctx = getRequestContext();
    const enrichedTags: Record<string, string | number> = {
      ...tags,
      value,
      tenantId: tags?.tenantId || ctx?.tenantId || "unknown",
    };

    Object.keys(enrichedTags).forEach((key) => {
      if (enrichedTags[key] === undefined) {
        delete enrichedTags[key];
      }
    });

    if (METRICS_PROVIDER === "redis" || METRICS_PROVIDER === "none") {
      // Redis doesn't have native gauge support, use counter with value tag
      incMetric(`${name}_gauge`, enrichedTags).catch(() => {});
    } else {
      // TODO: Integrate with Prometheus/Datadog SDK
      console.debug(`[Metrics] Gauge: ${name} = ${value}`, enrichedTags);
    }
  } catch (error) {
    console.debug(`[Metrics] Failed to record gauge ${name}:`, error);
  }
}

