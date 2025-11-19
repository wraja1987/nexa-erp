/**
 * Sentry Observability Helpers
 * Provides Sentry scope management and error capture with correlation IDs.
 */

import * as Sentry from "@sentry/nextjs";
import { getRequestContext } from "./requestContext";

const SENTRY_ENABLED = !!process.env.SENTRY_DSN;

/**
 * Run a function within a Sentry scope configured with request context.
 */
export function withSentryScope<T>(fn: () => Promise<T> | T): Promise<T> | T {
  if (!SENTRY_ENABLED) {
    // Sentry not configured, run function without scope
    return fn();
  }

  const ctx = getRequestContext();

  return Sentry.withScope((scope) => {
    // Set tags from request context
    if (ctx) {
      scope.setTag("correlationId", ctx.correlationId);
      scope.setTag("traceId", ctx.traceId || ctx.correlationId);
      scope.setTag("tenantId", ctx.tenantId || "unknown");
      scope.setTag("userId", ctx.userId || "unknown");
      if (ctx.module) {
        scope.setTag("module", ctx.module);
      }
    }

    // Set user context
    if (ctx?.tenantId || ctx?.userId) {
      scope.setUser({
        id: ctx.userId,
        tenantId: ctx.tenantId,
      });
    }

    return fn();
  });
}

/**
 * Capture an error to Sentry with optional extra context.
 * Safe to call even when Sentry is not configured (no-op).
 */
export function captureError(err: unknown, extra?: Record<string, unknown>): void {
  if (!SENTRY_ENABLED) {
    // Sentry not configured, no-op
    return;
  }

  const ctx = getRequestContext();

  Sentry.withScope((scope) => {
    // Set tags from request context
    if (ctx) {
      scope.setTag("correlationId", ctx.correlationId);
      scope.setTag("traceId", ctx.traceId || ctx.correlationId);
      scope.setTag("tenantId", ctx.tenantId || "unknown");
      scope.setTag("userId", ctx.userId || "unknown");
      if (ctx.module) {
        scope.setTag("module", ctx.module);
      }
    }

    // Set extra context
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    // Capture error
    if (err instanceof Error) {
      Sentry.captureException(err);
    } else {
      Sentry.captureMessage(String(err), "error");
    }
  });
}

/**
 * Capture a message to Sentry with optional level.
 * Safe to call even when Sentry is not configured (no-op).
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  if (!SENTRY_ENABLED) {
    return;
  }

  const ctx = getRequestContext();

  Sentry.withScope((scope) => {
    if (ctx) {
      scope.setTag("correlationId", ctx.correlationId);
      scope.setTag("traceId", ctx.traceId || ctx.correlationId);
      scope.setTag("tenantId", ctx.tenantId || "unknown");
      scope.setTag("userId", ctx.userId || "unknown");
      if (ctx.module) {
        scope.setTag("module", ctx.module);
      }
    }

    Sentry.captureMessage(message, level);
  });
}

