# Observability

- Health & metrics: `/api/health`, `/api/metrics` respond with overall status and simple counters.
- Logs: structured JSON with masking; correlation IDs per request.
- UI: `/admin/observability` shows masked logs and job last runs.
- OTEL/Sentry: initialised if envs present (`OTEL_EXPORTER_OTLP_ENDPOINT`, `SENTRY_DSN`), otherwise no-op.
