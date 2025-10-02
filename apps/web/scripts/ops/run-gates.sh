#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3010}"
HOST="localhost"
BASE="http://$HOST:$PORT"

echo "== Kill anything on :$PORT =="
PID="$(lsof -t -i :"$PORT" -sTCP:LISTEN || true)"
if [ -n "$PID" ]; then kill -9 "$PID" || true; fi

echo "== Install & build =="
pnpm -w install >/dev/null
pnpm build

echo "== Start server on $BASE with LOCAL_LH=1 =="
LOG="/tmp/nexa-web-$PORT.log"
env HOST="$HOST" PORT="$PORT" NODE_ENV=production LOCAL_LH=1 NEXTAUTH_URL="$BASE" pnpm start -p "$PORT" >"$LOG" 2>&1 &
SRV_PID=$!

cleanup() { kill "$SRV_PID" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM

echo "== Wait for readiness =="
for i in {1..90}; do
  curl -sSf "$BASE/login" >/dev/null 2>&1 && break || sleep 1
  if [ "$i" -eq 90 ]; then
    echo "❌ Server did not become ready. Tail: $LOG"
    tail -n 200 "$LOG" || true
    exit 1
  fi
done

echo "== Lighthouse: collect =="
pnpm dlx @lhci/cli@0.13.0 collect \
  --url "$BASE/login" \
  --url "$BASE/dashboard" \
  --numberOfRuns=1 \
  --settings.preset=desktop \
  --settings.disableStorageReset=true \
  --settings.chromeFlags="--no-sandbox --ignore-certificate-errors --allow-insecure-localhost --disable-dev-shm-usage --headless=new --disable-features=BlockInsecurePrivateNetworkRequests --allow-running-insecure-content --disable-site-isolation-trials"

echo "== Lighthouse: assert (perf ≥0.85, a11y ≥0.90) =="
pnpm dlx @lhci/cli@0.13.0 assert \
  --assertions.categories:performance="error:0.85" \
  --assertions.categories:accessibility="error:0.90" \
  --assertions.font-display="warn" \
  --assertions.modern-image-formats="warn"

echo "== Optional: upload reports (non-blocking) =="
pnpm dlx @lhci/cli@0.13.0 upload --target=temporary-public-storage || true

echo "== A11y smoke (server alive) =="
PW_BASE_URL="$BASE" LOCAL_LH=1 pnpm a11y:smoke || true

echo "== Sentry smoke =="
pnpm sentry:smoke || true

echo "✅ All done."




