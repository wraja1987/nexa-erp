"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

interface ObservabilityStatus {
  sentry: {
    enabled: boolean;
    dsn?: string;
    environment?: string;
  };
  metrics: {
    enabled: boolean;
    provider: string;
  };
  correlationIds: {
    header: string;
    description: string;
  };
}

export default function ObservabilityPage() {
  const [status, setStatus] = useState<ObservabilityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        // Load status from API (if available) or use client-side detection
        const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
        const metricsEnabled = process.env.NEXT_PUBLIC_METRICS_ENABLED === "true";
        const metricsProvider = process.env.NEXT_PUBLIC_METRICS_PROVIDER || "none";

        setStatus({
          sentry: {
            enabled: sentryEnabled,
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NEXT_PUBLIC_SENTRY_ENV,
          },
          metrics: {
            enabled: metricsEnabled,
            provider: metricsProvider,
          },
          correlationIds: {
            header: "x-correlation-id, x-trace-id",
            description: "Correlation IDs are automatically generated/extracted for all API requests and propagated to Sentry scope, events, and AI client.",
          },
        });
      } catch (error) {
        console.error("Failed to load observability status:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  return (
    <Page title="Observability">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-2">Observability Status</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Sentry, metrics, and distributed tracing configuration.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Sentry Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Sentry</h3>
              {status ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Enabled:</strong> {status.sentry.enabled ? "Yes" : "No"}
                  </div>
                  {status.sentry.enabled && (
                    <>
                      <div>
                        <strong>Environment:</strong> {status.sentry.environment || "Not set"}
                      </div>
                      <div>
                        <strong>DSN:</strong> {status.sentry.dsn ? "Configured" : "Not configured"}
                      </div>
                    </>
                  )}
                  {!status.sentry.enabled && (
                    <div className="text-yellow-600 mt-2">
                      Sentry is not enabled. Set SENTRY_DSN environment variable to enable error tracking.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load Sentry status
                </div>
              )}
            </div>

            {/* Metrics Status */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Metrics</h3>
              {status ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Enabled:</strong> {status.metrics.enabled ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Provider:</strong> {status.metrics.provider}
                  </div>
                  {!status.metrics.enabled && (
                    <div className="text-yellow-600 mt-2">
                      Metrics are disabled. Set NEXA_METRICS_ENABLED=true to enable metrics recording.
                    </div>
                  )}
                  {status.metrics.provider === "none" && (
                    <div className="text-yellow-600 mt-2">
                      Metrics provider is not configured. Set NEXA_METRICS_PROVIDER to "prometheus", "datadog", or "redis".
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load metrics status
                </div>
              )}
            </div>

            {/* Correlation IDs */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Correlation IDs & Tracing</h3>
              {status ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Headers:</strong> {status.correlationIds.header}
                  </div>
                  <div className="mt-2">
                    <strong>Description:</strong>
                    <p className="mt-1" style={{ color: "var(--color-muted)" }}>
                      {status.correlationIds.description}
                    </p>
                  </div>
                  <div className="mt-4">
                    <strong>How it works:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1" style={{ color: "var(--color-muted)" }}>
                      <li>Correlation IDs are automatically generated/extracted for all API requests</li>
                      <li>Trace IDs are propagated to events and AI client</li>
                      <li>All IDs are included in Sentry scope for error tracking</li>
                      <li>Response headers include x-correlation-id and x-trace-id</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Failed to load correlation ID info
                </div>
              )}
            </div>

            {/* Documentation Links */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-medium mb-4">Documentation</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <a
                    href="/docs/observability/PHASE20-observability.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Phase 20 Observability Documentation
                  </a>
                </div>
                <div>
                  <a
                    href="/docs/observability/PHASE20-dashboards.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Dashboard Definitions
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

