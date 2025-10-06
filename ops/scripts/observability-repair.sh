#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
REPORTS="$ROOT/reports/ops"
OPS="$ROOT/ops"
WF_SYN="$ROOT/.github/workflows/synthetic-ci.yml"
WF_UP="$ROOT/.github/workflows/uptime-ci.yml"
PLAY_DIR="$WEB/tests/synthetic"
SENTRY_ENV="$WEB/.env.production"

mkdir -p "$REPORTS" "$OPS/sentry" "$OPS/uptime" "$OPS/grafana" "$PLAY_DIR"

echo "== 0) Preconditions =="
if [ ! -f "$SENTRY_ENV" ]; then echo "❌ Missing $SENTRY_ENV"; exit 1; fi
if ! grep -q "SENTRY_DSN" "$SENTRY_ENV"; then echo "❌ SENTRY_DSN not found in $SENTRY_ENV"; exit 1; fi

echo "== 1) Ensure Playwright test deps and config =="
cd "$WEB"
if ! jq -e ".devDependencies[\"@playwright/test\"]" package.json >/dev/null 2>&1; then
  pnpm add -D @playwright/test
fi
if [ ! -f playwright.config.ts ]; then
  cat > playwright.config.ts <<'TS'
import { defineConfig } from "@playwright/test";
export default defineConfig({
  use: { headless: true, trace: "retain-on-failure", screenshot: "only-on-failure" },
  timeout: 60000
});
TS
fi

cat > "$PLAY_DIR/synthetic.spec.ts" <<'TS'
import { test, expect } from "@playwright/test";
const BASE="https://app.nexaai.co.uk";
test("Login → Dashboard KPI", async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("input[name=email]", process.env.NEXA_DEMO_EMAIL || "info@chiefaa.com");
  await page.fill("input[name=password]", process.env.NEXA_DEMO_PASSWORD || "Wolfish123");
  await page.getByRole("button", { name: /sign in|log in|continue/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  const kpi = page.locator("[data-kpi], [data-testid=kpi-card]");
  await expect(kpi.first()).toBeVisible({ timeout: 15000 });
});
TS

echo "== 2) Fix Synthetic CI workflow (pnpm + monorepo) =="
cat > "$WF_SYN" <<'YML'
name: Synthetic Transaction
on:
  schedule:
    - cron: "*/15 * * * *"
  workflow_dispatch:
jobs:
  synthetic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Install deps (workspace)
        run: pnpm -w install
      - name: Install Playwright browsers
        run: pnpm -C apps/web exec playwright install --with-deps
      - name: Run synthetic test
        env:
          NEXA_DEMO_EMAIL: ${{ secrets.NEXA_DEMO_EMAIL }}
          NEXA_DEMO_PASSWORD: ${{ secrets.NEXA_DEMO_PASSWORD }}
        run: pnpm -C apps/web exec playwright test tests/synthetic/synthetic.spec.ts
      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: synthetic-artifacts
          path: |
            apps/web/playwright-report/**
            apps/web/test-results/**
YML

echo "== 3) Fix Uptime CI workflow + script =="
cat > "$OPS/uptime/monitor.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports/ops
OUT="reports/ops/uptime-weekly-$(date +%Y%m%d).md"
APP="https://app.nexaai.co.uk/login"
API="https://app.nexaai.co.uk/api/kpi/dashboard"

probe() {
  local name="$1" url="$2"
  local code time
  time=$(date -Is)
  code=$(curl -fsS -o /dev/null -w "%{http_code}" "$url" || echo 000)
  echo "- ${time} ${name}: HTTP ${code} ${url}" >> "$OUT"
}

echo "# Nexa Uptime Weekly Report — $(date -Is)" > "$OUT"
probe "App" "$APP"
probe "API" "$API"
if command -v openssl >/dev/null 2>&1; then
  exp=$(openssl s_client -connect app.nexaai.co.uk:443 -servername app.nexaai.co.uk </dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2 || true)
  if [ -n "${exp:-}" ]; then
    days=$(( ( $(date -d "$exp" +%s) - $(date +%s) )/86400 ))
    echo "- SSL: certificate expires on ${exp} (in ${days} days)" >> "$OUT"
  fi
fi
echo "" >> "$OUT"
SH
chmod +x "$OPS/uptime/monitor.sh"

cat > "$WF_UP" <<'YML'
name: Uptime Monitors
on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:
jobs:
  uptime:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run uptime monitors
        run: bash ops/uptime/monitor.sh
      - name: Upload weekly report
        uses: actions/upload-artifact@v4
        with:
          name: uptime-weekly
          path: reports/ops/uptime-weekly-*.md
YML

echo "== 4) Sentry alert rule via API (if secrets exist) =="
cd "$ROOT"
ALERT_JSON="$OPS/sentry/alerts.json"
cat > "$ALERT_JSON" <<'JSON'
{
  "name": "Nexa ERP Critical Alerts",
  "environment": "production",
  "actionMatch": "any",
  "filterMatch": "all",
  "conditions": [
    {"id": "sentry.rules.conditions.regression_event.RegressionEventCondition"},
    {"id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition", "interval": "1h", "value": 10, "comparisonType": "count"}
  ],
  "actions": [
    {"id": "sentry.mail.actions.NotifyEmailAction", "targetType": "IssueOwners", "targetIdentifier": null}
  ],
  "frequency": 5
}
JSON

SENTRY_ORG="${SENTRY_ORG:-${SENTRY_ORG:-}}"
SENTRY_PROJECT="${SENTRY_PROJECT:-${SENTRY_PROJECT:-}}"
SENTRY_TOKEN="${SENTRY_TOKEN:-${SENTRY_AUTH_TOKEN:-}}"

SENTRY_STATUS="skipped"
if [ -n "${SENTRY_ORG:-}" ] && [ -n "${SENTRY_PROJECT:-}" ] && [ -n "${SENTRY_TOKEN:-}" ]; then
  echo "Attempting Sentry rule upsert…"
  set +e
  CREATE=$(curl -sS -X POST "https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/rules/" \
    -H "Authorization: Bearer ${SENTRY_TOKEN}" -H "Content-Type: application/json" \
    --data-binary @"$ALERT_JSON")
  RC=$?
  set -e
  if [ $RC -eq 0 ] && echo "$CREATE" | grep -q "\"id\":"; then
    SENTRY_STATUS="created"
  else
    SENTRY_STATUS="manual-needed"
  fi
else
  SENTRY_STATUS="secrets-missing"
fi

echo "== 5) Grafana dashboard import (if secrets exist) =="
GRAF_DASH="$OPS/grafana/dashboards.json"
cat > "$GRAF_DASH" <<'JSON'
{
 "dashboard": {
  "title": "Nexa ERP Ops Overview",
  "schemaVersion": 39,
  "panels": [
    { "type": "timeseries", "title": "HTTP Latency p95", "targets": [{"expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))"}] },
    { "type": "timeseries", "title": "HTTP 5xx Rate", "targets": [{"expr": "rate(http_requests_total{status=~\"5..\"}[5m])"}] },
    { "type": "timeseries", "title": "Postgres Locks", "targets": [{"expr": "pg_locks_count"}] },
    { "type": "timeseries", "title": "Redis Memory", "targets": [{"expr": "redis_memory_used_bytes"}] }
  ],
  "time": { "from": "now-6h", "to": "now" }
 },
 "overwrite": true
}
JSON

GRAFANA_URL="${GRAFANA_URL:-}"
GRAFANA_TOKEN="${GRAFANA_TOKEN:-}"
GRAF_STATUS="skipped"
if [ -n "${GRAFANA_URL:-}" ] && [ -n "${GRAFANA_TOKEN:-}" ]; then
  set +e
  RES=$(curl -sS -X POST "$GRAFANA_URL/api/dashboards/db" \
    -H "Authorization: Bearer $GRAFANA_TOKEN" -H "Content-Type: application/json" \
    --data-binary @"$GRAF_DASH")
  RC=$?
  set -e
  if [ $RC -eq 0 ] && echo "$RES" | grep -qi '"status":"success"'; then
    GRAF_STATUS="imported"
  else
    GRAF_STATUS="manual-needed"
  fi
else
  GRAF_STATUS="secrets-missing"
fi

echo "== 6) Final report =="
STAMP=$(date +%Y%m%d-%H%M%S)
REPORT="$REPORTS/observability-setup-$STAMP.md"
cat > "$REPORT" <<MD
# Nexa Observability & Alerts — Setup Report ($STAMP)

## Synthetic CI
- Workflow: .github/workflows/synthetic-ci.yml (pnpm + monorepo) — READY
- Test path: apps/web/tests/synthetic/synthetic.spec.ts

## Uptime CI
- Workflow: .github/workflows/uptime-ci.yml — READY
- Report artefact: reports/ops/uptime-weekly-*.md (uploaded weekly)

## Sentry alerts
- Rule JSON: ops/sentry/alerts.json
- API upsert: $SENTRY_STATUS
  - Required secrets (if missing): **SENTRY_ORG**, **SENTRY_PROJECT**, **SENTRY_TOKEN**
  - Email routing: Sentry → Project → Alerts → Issue Owners (ensure **info@chiefaa.com** is a member)

## Grafana dashboard
- Template JSON: ops/grafana/dashboards.json
- Import status: $GRAF_STATUS
  - Required secrets (if missing): **GRAFANA_URL**, **GRAFANA_TOKEN**
  - Data sources expected: Prometheus with http_* , pg_* , redis_* metrics

## Next actions (only if marked secrets-missing/manual-needed)
- Add GitHub Actions repo secrets:
  - NEXA_DEMO_EMAIL, NEXA_DEMO_PASSWORD
  - SENTRY_ORG, SENTRY_PROJECT, SENTRY_TOKEN (optional, for API upsert)
  - GRAFANA_URL, GRAFANA_TOKEN (optional, for API import)
- Re-run: Synthetic Transaction (workflow_dispatch) and Uptime Monitors.
MD

echo "== Done =="
echo "$REPORT"



