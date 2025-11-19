/**
 * API Observability Wrapper
 * Wraps API route handlers with correlation IDs, Sentry scope, and error handling.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRequestContext, withRequestContext, getRequestContext } from "./requestContext";
import { withSentryScope, captureError } from "./sentry";
import { getSessionContext } from "@/lib/auth/tenant.server";

type ApiHandler = (req: NextRequest, context?: any) => Promise<Response> | Response;

interface ApiObservabilityOptions {
  module?: string;
  captureErrors?: boolean; // Default: true
}

/**
 * Wrap an API route handler with observability features:
 * - Correlation ID extraction and propagation
 * - Request context setup
 * - Sentry scope configuration
 * - Error capture
 */
export function withApiObservability(
  handler: ApiHandler,
  options: ApiObservabilityOptions = {}
): ApiHandler {
  const { module, captureErrors = true } = options;

  return async (req: NextRequest, context?: any) => {
    // Extract tenant/user info (best-effort, may fail if not authenticated)
    let tenantId: string | undefined;
    let userId: string | undefined;

    try {
      const sessionCtx = await getSessionContext();
      tenantId = sessionCtx.tenantId;
      userId = sessionCtx.userId;
    } catch {
      // Not authenticated, continue without tenant/user info
    }

    // Create request context
    const requestContext = createRequestContext(req.headers, {
      tenantId,
      userId,
      module,
    });

    // Run handler within request context and Sentry scope
    return withRequestContext(requestContext, () => {
      return withSentryScope(async () => {
        try {
          const response = await handler(req, context);

          // Add correlation/trace headers to response
          if (response instanceof NextResponse) {
            response.headers.set("x-correlation-id", requestContext.correlationId);
            response.headers.set("x-trace-id", requestContext.traceId);
            return response;
          } else if (response instanceof Response) {
            response.headers.set("x-correlation-id", requestContext.correlationId);
            response.headers.set("x-trace-id", requestContext.traceId);
            return response;
          } else {
            // If handler returns a plain object, wrap it in NextResponse
            return NextResponse.json(response, {
              headers: {
                "x-correlation-id": requestContext.correlationId,
                "x-trace-id": requestContext.traceId,
              },
            });
          }
        } catch (error) {
          // Capture error to Sentry if enabled
          if (captureErrors) {
            captureError(error, {
              module: module || "api",
              operation: "api_handler",
              correlationId: requestContext.correlationId,
              traceId: requestContext.traceId,
            });
          }

          // Re-throw to let Next.js handle it (or return error response)
          throw error;
        }
      });
    });
  };
}

