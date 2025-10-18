#!/usr/bin/env bash
set -euo pipefail
BASE="${NEXT_PUBLIC_APP_URL:-https://app.nexaai.co.uk}"
echo "== DB check ==" && curl -s "$BASE/api/_diag/na-db" | jq || true
echo "== NextAuth ==" && curl -s "$BASE/api/_diag/na-nextauth" | jq || true
echo "== Providers ==" && curl -s "$BASE/api/auth/providers" | jq || true
echo "== Email POST smoke ==" && curl -i -X POST "$BASE/api/auth/signin/email?json=true" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "email=test@example.com&callbackUrl=%2Fdashboard" | sed -n '1,40p'


