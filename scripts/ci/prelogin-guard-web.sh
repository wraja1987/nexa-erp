#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-3000}

pnpm --filter web build >/dev/null 2>&1 || true
pnpm --filter web start -p "$PORT" >/tmp/nexa-ci-web.log 2>&1 &
PID=$!
cleanup(){ kill $PID 2>/dev/null || true; }
trap cleanup EXIT

for i in {1..60}; do curl -fsS "http://localhost:$PORT" >/dev/null 2>&1 && break || sleep 1; done || true

check(){ url="$1"; body=$(curl -fsS "http://localhost:$PORT$url" || true); echo "$body" | grep -E -i "Billing|Developer Portal|Monitoring|Settings|Help" && {
  echo "Prelogin leak detected on $url"; exit 1; } || echo "OK $url"; }

check /login
check /forgot-password

echo "Prelogin guard (web) passed."


