import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrCreateCorrelationId, createRequestContext, withRequestContext, getRequestContext } from "../requestContext";
import { incrementCounter, recordDuration } from "../metrics";
import { withApiObservability } from "../apiWrapper";
import { NextRequest, NextResponse } from "next/server";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((fn) => fn()),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

// Mock metrics
vi.mock("@/lib/observability/metrics", () => ({
  incMetric: vi.fn().mockResolvedValue(undefined),
}));

// Mock auth
vi.mock("@/lib/auth/tenant.server", () => ({
  getSessionContext: vi.fn().mockResolvedValue({ tenantId: "t-123", userId: "u-456" }),
}));

describe("Observability Phase 20 Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.NEXA_METRICS_ENABLED;
    delete process.env.NEXA_METRICS_PROVIDER;
  });

  describe("Correlation ID", () => {
    it("reuses header value when present", () => {
      const headers = new Headers();
      headers.set("x-correlation-id", "test-correlation-id-123");
      const id = getOrCreateCorrelationId(headers);
      expect(id).toBe("test-correlation-id-123");
    });

    it("generates UUID when absent", () => {
      const headers = new Headers();
      const id = getOrCreateCorrelationId(headers);
      expect(id).toBeTruthy();
      expect(id.length).toBeGreaterThan(0);
      // Should be a UUID format (36 chars with hyphens)
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("handles plain object headers", () => {
      const headers = { "x-correlation-id": "test-id-456" };
      const id = getOrCreateCorrelationId(headers);
      expect(id).toBe("test-id-456");
    });
  });

  describe("Request Context (AsyncLocalStorage)", () => {
    it("withRequestContext makes getRequestContext return expected values", async () => {
      const ctx = createRequestContext(new Headers(), { tenantId: "t-123", userId: "u-456", module: "finance" });

      await withRequestContext(ctx, async () => {
        const retrieved = getRequestContext();
        expect(retrieved).toBeDefined();
        expect(retrieved?.correlationId).toBe(ctx.correlationId);
        expect(retrieved?.traceId).toBe(ctx.traceId);
        expect(retrieved?.tenantId).toBe("t-123");
        expect(retrieved?.userId).toBe("u-456");
        expect(retrieved?.module).toBe("finance");
      });

      // Context should not be available outside
      const outside = getRequestContext();
      expect(outside).toBeUndefined();
    });

    it("nested contexts work correctly", async () => {
      const outerCtx = createRequestContext(new Headers(), { tenantId: "t-outer" });
      const innerCtx = createRequestContext(new Headers(), { tenantId: "t-inner" });

      await withRequestContext(outerCtx, async () => {
        expect(getRequestContext()?.tenantId).toBe("t-outer");

        await withRequestContext(innerCtx, async () => {
          expect(getRequestContext()?.tenantId).toBe("t-inner");
        });

        expect(getRequestContext()?.tenantId).toBe("t-outer");
      });
    });
  });

  describe("Metrics", () => {
    it("incrementCounter does not throw when metrics disabled", () => {
      process.env.NEXA_METRICS_ENABLED = "false";
      expect(() => {
        incrementCounter("test_counter", { module: "test" });
      }).not.toThrow();
    });

    it("recordDuration does not throw when metrics disabled", () => {
      process.env.NEXA_METRICS_ENABLED = "false";
      expect(() => {
        recordDuration("test_duration", 100, { module: "test" });
      }).not.toThrow();
    });

    it("incrementCounter enriches tags with request context when available", async () => {
      process.env.NEXA_METRICS_ENABLED = "true";
      process.env.NEXA_METRICS_PROVIDER = "redis";

      const ctx = createRequestContext(new Headers(), { tenantId: "t-123", userId: "u-456" });

      await withRequestContext(ctx, () => {
        incrementCounter("test_counter", { module: "test" });
      });

      // Verify incMetric was called (via mock)
      const { incMetric } = await import("@/lib/observability/metrics");
      expect(vi.mocked(incMetric)).toHaveBeenCalled();
    });
  });

  describe("API Wrapper", () => {
    it("wraps handler and adds correlation/trace headers", async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));

      const wrapped = withApiObservability(handler);
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-correlation-id": "test-correlation-id" },
      });

      const response = await wrapped(req);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(response).toBeInstanceOf(NextResponse);
      const headers = (response as NextResponse).headers;
      expect(headers.get("x-correlation-id")).toBe("test-correlation-id");
      expect(headers.get("x-trace-id")).toBeTruthy();
    });

    it("generates correlation ID when header is missing", async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));

      const wrapped = withApiObservability(handler);
      const req = new NextRequest("http://localhost/api/test");

      const response = await wrapped(req);

      expect(handler).toHaveBeenCalledTimes(1);
      const headers = (response as NextResponse).headers;
      const correlationId = headers.get("x-correlation-id");
      expect(correlationId).toBeTruthy();
      expect(correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("captures errors when handler throws", async () => {
      const error = new Error("Test error");
      const handler = vi.fn().mockRejectedValue(error);

      const wrapped = withApiObservability(handler, { captureErrors: true });
      const req = new NextRequest("http://localhost/api/test");

      await expect(wrapped(req)).rejects.toThrow("Test error");

      // Verify Sentry was called (via mock)
      const Sentry = await import("@sentry/nextjs");
      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalled();
    });

    it("does not capture errors when captureErrors is false", async () => {
      const error = new Error("Test error");
      const handler = vi.fn().mockRejectedValue(error);

      const wrapped = withApiObservability(handler, { captureErrors: false });
      const req = new NextRequest("http://localhost/api/test");

      await expect(wrapped(req)).rejects.toThrow("Test error");

      // Verify Sentry was NOT called
      const Sentry = await import("@sentry/nextjs");
      expect(vi.mocked(Sentry.captureException)).not.toHaveBeenCalled();
    });
  });
});

