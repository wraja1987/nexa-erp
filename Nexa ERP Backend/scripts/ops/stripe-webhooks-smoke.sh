#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
REPORTS="$BACKEND/reports"
ENV_FILE="$BACKEND/deploy/.env"
HOST="${HOST:-https://api.nexaai.co.uk}"
mkdir -p "$REPORTS"

echo "== 1) Run webhook unit/integration tests (Billing + POS) =="
cd "$ROOT"
(corepack enable >/dev/null 2>&1 || true)
(pnpm -w install >/dev/null || true)
TEST_LOG="$REPORTS/stripe-webhooks-tests-$(date +%Y%m%d%H%M%S).log"
pnpm -w test --filter @nexa/web -- --run apps/web/src/app/api/billing/stripe/webhook/route.test.ts apps/web/src/app/api/pos/stripe/webhook/route.test.ts | tee "$TEST_LOG" || true

echo
echo "== 2) Live signed smoke calls (production endpoints) =="

env_get(){ local key="$1"; grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -n1 | cut -d= -f2-; }

BILL_URL="$HOST/api/billing/webhook"
POS_URL="$HOST/api/pos/stripe/webhook"

BILL_SECRET="${STRIPE_WEBHOOK_SECRET:-$(env_get STRIPE_WEBHOOK_SECRET || true)}"
POS_SECRET="${STRIPE_WEBHOOK_SECRET_POS:-$(env_get STRIPE_WEBHOOK_SECRET_POS || true)}"; [ -z "${POS_SECRET:-}" ] && POS_SECRET="$BILL_SECRET"

SMOKE_LOG="$REPORTS/stripe-webhooks-smoke-$(date +%Y%m%d%H%M%S).log"; : > "$SMOKE_LOG"

smoke_call(){ # $1=url $2=secret $3=type
  local url="$1" secret="$2" etype="$3"
  local ts payload signed sig code
  ts="$(date +%s)"
  payload="{\"id\":\"evt_smoke_${etype}_$ts\",\"type\":\"$etype\",\"data\":{\"object\":{\"id\":\"pi_smoke_$ts\"}}}"
  signed="$(printf "%s.%s" "$ts" "$payload" | openssl dgst -sha256 -hmac "$secret" -binary | xxd -p -c 256)"
  sig="t=$ts,v1=$signed"
  echo "--- Hitting $url [$etype]" | tee -a "$SMOKE_LOG"
  code="$(curl -sS -o /tmp/resp.json -w "%{http_code}" -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: $sig" \
    --data "$payload" || true)"
  echo "HTTP $code — response:" | tee -a "$SMOKE_LOG"
  sed "s/.*/    &/" /tmp/resp.json | tee -a "$SMOKE_LOG" || true
  echo >> "$SMOKE_LOG"
  case "$code" in 2*) return 0 ;; *) return 1 ;; esac
}

BILL_OK=FAIL; POS_OK=FAIL
if [ -n "${BILL_SECRET:-}" ]; then
  smoke_call "$BILL_URL" "$BILL_SECRET" "payment_intent.succeeded" && BILL_OK=PASS || BILL_OK=FAIL
else
  echo "[warn] STRIPE_WEBHOOK_SECRET missing for Billing" | tee -a "$SMOKE_LOG"
fi

if [ -n "${POS_SECRET:-}" ]; then
  smoke_call "$POS_URL" "$POS_SECRET" "payment_intent.succeeded" && POS_OK=PASS || POS_OK=FAIL
else
  echo "[warn] STRIPE_WEBHOOK_SECRET_POS/STRIPE_WEBHOOK_SECRET missing for POS" | tee -a "$SMOKE_LOG"
fi

echo
echo "== 3) Summary =="
echo "Tests log : $TEST_LOG"
echo "Smoke log : $SMOKE_LOG"
grep -E "Test Files|Tests +[0-9]+ passed|failed" "$TEST_LOG" | tail -n 10 | sed "s/^/  /" || true
echo "  Billing webhook smoke: $BILL_OK ($BILL_URL)"
echo "  POS webhook smoke    : $POS_OK ($POS_URL)"

[ "$BILL_OK" = PASS ] && [ "$POS_OK" = PASS ]








