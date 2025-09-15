#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
REPORTS="$BACKEND/reports"
ENV_FILE="$BACKEND/deploy/.env"
HOST="${HOST:-https://api.nexaai.co.uk}"
mkdir -p "$REPORTS"

# Read value of KEY from .env (supports values with = in them)
env_get(){
  local key="$1"
  local line
  line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -n1 || true)
  [ -z "$line" ] && return 1
  printf "%s" "${line#*=}"
}

if [ ! -f "$ENV_FILE" ]; then
  echo "[fatal] Missing $ENV_FILE" >&2
  exit 1
fi

BILL_URL="$HOST/api/billing/webhook"
POS_URL="$HOST/api/pos/stripe/webhook"
BILL_SECRET="${STRIPE_WEBHOOK_SECRET:-$(env_get STRIPE_WEBHOOK_SECRET || true)}"
POS_SECRET="${STRIPE_WEBHOOK_SECRET_POS:-$(env_get STRIPE_WEBHOOK_SECRET_POS || true)}"
[ -z "${POS_SECRET:-}" ] && POS_SECRET="$BILL_SECRET"

SMOKE_LOG="$REPORTS/stripe-webhooks-live-smoke-$(date +%Y%m%d%H%M%S).log"; : > "$SMOKE_LOG"

smoke_call(){
  local url="$1" secret="$2" etype="$3"
  local ts payload signed sig code
  ts="$(date +%s)"
  payload="{\"id\":\"evt_smoke_${etype}_$ts\",\"type\":\"$etype\",\"data\":{\"object\":{\"id\":\"pi_smoke_$ts\"}}}"
  signed="$(printf "%s.%s" "$ts" "$payload" | openssl dgst -sha256 -hmac "$secret" -binary | xxd -p -c 256)"
  sig="t=$ts,v1=$signed"
  echo "--- $url [$etype]" | tee -a "$SMOKE_LOG"
  code="$(curl -sS -o /tmp/resp.json -w "%{http_code}" -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Stripe-Signature: $sig" \
    --data "$payload" || true)"
  echo "HTTP $code — response:" | tee -a "$SMOKE_LOG"
  sed "s/.*/    &/" /tmp/resp.json | tee -a "$SMOKE_LOG" || true
  echo >> "$SMOKE_LOG"
  case "$code" in 2*) return 0 ;; *) return 1 ;; esac
}

echo "== Stripe secrets (masked) ==" | tee -a "$SMOKE_LOG"
mask(){ v="$1"; n=${#v}; if [ "$n" -le 8 ]; then printf "****"; else printf "%s****%s" "${v:0:6}" "${v:$((n-4))}"; fi; }
echo "  STRIPE_WEBHOOK_SECRET=$(mask "${BILL_SECRET:-}")" | tee -a "$SMOKE_LOG"
echo "  STRIPE_WEBHOOK_SECRET_POS=$(mask "${POS_SECRET:-}")" | tee -a "$SMOKE_LOG"

BILL_OK=FAIL; POS_OK=FAIL
if [ -n "${BILL_SECRET:-}" ]; then
  smoke_call "$BILL_URL" "$BILL_SECRET" "payment_intent.succeeded" && BILL_OK=PASS || BILL_OK=FAIL
else
  echo "[warn] STRIPE_WEBHOOK_SECRET missing" | tee -a "$SMOKE_LOG"
fi

if [ -n "${POS_SECRET:-}" ]; then
  smoke_call "$POS_URL" "$POS_SECRET" "payment_intent.succeeded" && POS_OK=PASS || POS_OK=FAIL
else
  echo "[warn] STRIPE_WEBHOOK_SECRET_POS/STRIPE_WEBHOOK_SECRET missing" | tee -a "$SMOKE_LOG"
fi

echo "Billing: $BILL_OK  POS: $POS_OK  | Log: $SMOKE_LOG"
[ "$BILL_OK" = PASS ] && [ "$POS_OK" = PASS ]








