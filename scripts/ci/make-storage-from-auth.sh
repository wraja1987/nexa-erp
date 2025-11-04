#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${PW_BASE_URL:-http://localhost:3000}"
EMAIL="${NEXA_E2E_EMAIL:-info@nexaai.co.uk}"
PASS="${NEXA_E2E_PASSWORD:-NexaSuper!123}"

workdir="$(cd "$(dirname "$0")/../.." && pwd)"
cookies="${TMPDIR:-/tmp}/nexa-ci-cookies.txt"
csrf_out="${TMPDIR:-/tmp}/nexa-ci-csrf.json"
login_out="${TMPDIR:-/tmp}/nexa-ci-login.txt"

rm -f "$cookies" "$csrf_out" "$login_out" || true

curl -sS -i -c "$cookies" "$BASE_URL/api/auth/csrf" | tee "$csrf_out" >/dev/null
CSRF_TOKEN=$(sed -nE 's/.*"csrfToken":"([^"]+)".*/\1/p' "$csrf_out" | head -n1)
if [ -z "$CSRF_TOKEN" ]; then
  echo "Failed to fetch CSRF token from $BASE_URL" >&2
  exit 3
fi

curl -sS -i -b "$cookies" -c "$cookies" -X POST \
  "$BASE_URL/api/auth/callback/credentials" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "email=$EMAIL" \
  --data-urlencode "password=$PASS" | tee "$login_out" >/dev/null

TOKEN=$(sed -nE 's/^.*[Nn]ext-[Aa]uth\.session-token=([^;]+);.*$/\1/p' "$login_out" | head -n1 | tr -d '\r')
if [ -z "$TOKEN" ]; then
  echo "Failed to get next-auth session token — check credentials." >&2
  exit 4
fi

export PW_BASE_URL="$BASE_URL"
export NEXA_SESSION_TOKEN="$TOKEN"

cd "$workdir"
pnpm -s tsx scripts/e2e-write-storage.ts
echo "Storage state written for $BASE_URL"


