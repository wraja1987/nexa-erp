/**
 * Request Context
 * Provides request-scoped correlation IDs and context using AsyncLocalStorage.
 */

import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface RequestContext {
  correlationId: string;
  traceId: string;
  spanId?: string;
  tenantId?: string;
  userId?: string;
  module?: string;
}

const requestContextStore = new AsyncLocalStorage<RequestContext>();

/**
 * Get or create correlation ID from headers.
 * Uses x-correlation-id if present, else generates a UUID.
 */
export function getOrCreateCorrelationId(headers: Headers | Record<string, string>): string {
  // Handle Headers object
  if (headers instanceof Headers) {
    const fromHeader = headers.get("x-correlation-id") || headers.get("traceparent") || "";
    if (fromHeader) return fromHeader;
  } else {
    // Handle plain object
    const fromHeader = headers["x-correlation-id"] || headers["traceparent"] || "";
    if (fromHeader) return fromHeader;
  }

  // Generate UUID if not present
  return randomUUID();
}

/**
 * Run a function within a request context.
 */
export function withRequestContext<T>(ctx: RequestContext, fn: () => Promise<T> | T): Promise<T> | T {
  return requestContextStore.run(ctx, fn);
}

/**
 * Get the current request context.
 * Returns undefined if called outside of a request context.
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStore.getStore();
}

/**
 * Create a new request context from headers and optional tenant/user info.
 */
export function createRequestContext(
  headers: Headers | Record<string, string>,
  options?: {
    tenantId?: string;
    userId?: string;
    module?: string;
  }
): RequestContext {
  const correlationId = getOrCreateCorrelationId(headers);
  const traceId = correlationId; // Use correlation ID as trace ID for simplicity

  return {
    correlationId,
    traceId,
    spanId: randomUUID(), // Generate span ID for this operation
    tenantId: options?.tenantId,
    userId: options?.userId,
    module: options?.module,
  };
}

