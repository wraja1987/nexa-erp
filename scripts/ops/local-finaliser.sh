#!/usr/bin/env bash

# Nexa — Perf & Ops FINALISER (local run)
# Rebuilds, kills stray servers, runs Lighthouse on standalone server (port 3010), a11y smoke, Sentry smoke.
# Idempotent. Requires Node 22.x + pnpm. Run inside Cursor as one command.

set -euo pipefail

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
PORT="${LHCI_PORT:-3010}"

# ---- Guards
[ -d "$WEB" ] || { echo "❌ Missing path: $WEB"; exit 1; }
command -v pnpm >/dev/null || { echo "❌ pnpm not found"; exit 1; }

# ---- Helper: wait for URL
wait_for() {
  local url="$1"; local timeout="${2:-120}"; local end=$((SECONDS+timeout))
  until curl -sSf -o /dev/null "$url"; do
    [ $SECONDS -ge $end ] && { echo "❌ Timeout waiting for $url"; return 1; }
    sleep 1
  done
}

echo "== 1) Install workspace deps =="
cd "$ROOT"
pnpm -w install >/dev/null

echo "== 2) Build production bundle (standalone) =="
cd "$WEB"
pnpm build

[ -d ".next" ] || { echo "❌ .next directory not found after build"; exit 1; }

echo "== 3) Kill any stray server on port $PORT =="
pkill -f ".next/standalone/server.js" >/dev/null 2>&1 || true
if lsof -i :"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  PID="$(lsof -t -i :"$PORT" -sTCP:LISTEN | head -n1 || true)"
  [ -n "${PID:-}" ] && kill -9 "$PID" || true
fi

echo "== 4) Start Next server on 127.0.0.1:$PORT =="
# Run in background; ensure env is production and base URL matches port to avoid redirects
( HOST=127.0.0.1 NODE_ENV=production NEXTAUTH_URL="http://127.0.0.1:$PORT" NEXA_DISABLE_UPGRADE_INSECURE=1 pnpm start -p "$PORT" ) >/tmp/nexa-standalone.log 2>&1 &
SRV_PID=$!
sleep 1

echo "== 5) Readiness check =="
wait_for "http://127.0.0.1:$PORT/"

echo "== 6) Lighthouse CI (collect → assert → upload) =="
# Ensure LHCI is available (installed earlier; install if missing)
pnpm dlx @lhci/cli@0.12.x collect \
  --url "http://127.0.0.1:$PORT/" \
  --url "http://127.0.0.1:$PORT/login" \
  --url "http://127.0.0.1:$PORT/dashboard" \
  --numberOfRuns=1 \
  --settings.preset=desktop \
  --settings.disableStorageReset=true \
  --settings.chromeFlags="--no-sandbox --ignore-certificate-errors --allow-insecure-localhost --disable-dev-shm-usage --headless=new"

pnpm dlx @lhci/cli@0.12.x assert \
  --assertions.categories:performance="error:0.85" \
  --assertions.categories:accessibility="error:0.90" \
  --assertions.uses-responsive-images="warn" \
  --assertions.uses-webp-images="warn" \
  --assertions.font-display="warn"

pnpm dlx @lhci/cli@0.12.x upload --target=temporary-public-storage || true

echo "== 7) Accessibility smoke (report-only) =="
pnpm a11y:smoke || true

echo "== 8) Sentry smoke (uses @sentry/node) =="
pnpm sentry:smoke || true

echo "== 9) Cleanup server =="
kill "$SRV_PID" >/dev/null 2>&1 || true

echo
echo "✅ Completed: build + Lighthouse gate (perf ≥0.85, a11y ≥0.90) + a11y smoke + Sentry smoke"
echo "ℹ If anything 'hangs' again:"
echo "   - lsof -i :$PORT"
echo "   - kill -9 <PID>"
echo "   - re-run this command"

