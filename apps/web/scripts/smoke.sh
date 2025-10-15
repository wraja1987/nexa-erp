#!/usr/bin/env bash
set -euo pipefail

URL="${URL:-https://web-bov1d391k-waheeds-projects-690d64dd.vercel.app}"

echo "🔎 Target: $URL"
echo "--- /login (headers) ---"
curl -Is "$URL/login" | head -n 12 || true

echo "--- /api/health (json) ---"
curl -sS "$URL/api/health" || true
echo

echo "--- /api/status (auth json) ---"
if [[ -z "${STATUS_TOKEN:-}" ]]; then
  echo "⚠️ STATUS_TOKEN not set; skipping auth check."
else
  curl -sS -H "Authorization: Bearer $STATUS_TOKEN" "$URL/api/status" || true
  echo
fi

echo "✅ Smoke complete."





