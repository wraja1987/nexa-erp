# Nexa Observability & Alerts — Setup Report (20251006-081408)

## Synthetic CI
- Workflow: .github/workflows/synthetic-ci.yml (pnpm + monorepo) — READY
- Test path: apps/web/tests/synthetic/synthetic.spec.ts

## Uptime CI
- Workflow: .github/workflows/uptime-ci.yml — READY
- Report artefact: reports/ops/uptime-weekly-*.md (uploaded weekly)

## Sentry alerts
- Rule JSON: ops/sentry/alerts.json
- API upsert: secrets-missing
  - Required secrets (if missing): **SENTRY_ORG**, **SENTRY_PROJECT**, **SENTRY_TOKEN**
  - Email routing: Sentry → Project → Alerts → Issue Owners (ensure **info@chiefaa.com** is a member)

## Grafana dashboard
- Template JSON: ops/grafana/dashboards.json
- Import status: secrets-missing
  - Required secrets (if missing): **GRAFANA_URL**, **GRAFANA_TOKEN**
  - Data sources expected: Prometheus with http_* , pg_* , redis_* metrics

## Next actions (only if marked secrets-missing/manual-needed)
- Add GitHub Actions repo secrets:
  - NEXA_DEMO_EMAIL, NEXA_DEMO_PASSWORD
  - SENTRY_ORG, SENTRY_PROJECT, SENTRY_TOKEN (optional, for API upsert)
  - GRAFANA_URL, GRAFANA_TOKEN (optional, for API import)
- Re-run: Synthetic Transaction (workflow_dispatch) and Uptime Monitors.
