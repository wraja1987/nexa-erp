#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-3010}"
echo "== Local LH gate (prod build, /login & /dashboard) =="
LOCAL_LH=1 pnpm -s lh:ci || { echo "❌ Budgets failed"; pnpm -s lh:summary || true; exit 1; }

echo "== Auth enforcement sanity (no LOCAL_LH) =="
NODE_ENV=production pnpm -s start:prod >/dev/null 2>&1 &
PID=$!
sleep 3
echo -n "/login → ";  curl -sSI "http://127.0.0.1:$PORT/login"     | head -n1
echo -n "/dashboard (should redirect/protect) → "; curl -sSI "http://127.0.0.1:$PORT/dashboard" | head -n1
kill "$PID" >/dev/null 2>&1 || true
echo "✅ Verifier complete."
