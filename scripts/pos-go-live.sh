#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

ensure_kv() {
  local f="$1" k="$2" v="$3"
  touch "$f"
  if grep -q "^[[:space:]]*$k=" "$f" ; then
    perl -0777 -i -pe "s|^$k=.*|$k=${v//|/\\|}|m" "$f"
  else
    printf "%s=%s\n" "$k" "$v" >> "$f"
  fi
}

cp -n .env .env.bak 2>/dev/null || true
ensure_kv .env APP_BASE_URL "${APP_BASE_URL:-http://localhost:3000}"
ensure_kv .env STRIPE_PUBLISHABLE_KEY "${STRIPE_PUBLISHABLE_KEY:-pk_live_REPLACE_ME}"
ensure_kv .env STRIPE_SECRET_KEY      "${STRIPE_SECRET_KEY:-sk_live_REPLACE_ME}"
ensure_kv .env STRIPE_WEBHOOK_SECRET  "${STRIPE_WEBHOOK_SECRET:-whsec_REPLACE_ME}"
ensure_kv .env POS_POSTING_ENABLED "true"
ensure_kv .env POS_ENABLED "true"
ensure_kv .env POS_ALLOW_OFFLINE "${POS_ALLOW_OFFLINE:-true}"
ensure_kv .env POS_DEFAULT_TAX_RATE "${POS_DEFAULT_TAX_RATE:-0.20}"
ensure_kv .env POS_PRINTER_MODE "${POS_PRINTER_MODE:-pdf}"
ensure_kv .env POS_PRINTER_HOST "${POS_PRINTER_HOST:-192.168.1.50}"
ensure_kv .env POS_PRINTER_PORT "${POS_PRINTER_PORT:-9100}"
ensure_kv .env NEXT_PUBLIC_POS_DEFAULT_TAX_RATE "${NEXT_PUBLIC_POS_DEFAULT_TAX_RATE:-0.20}"
ensure_kv .env NEXT_PUBLIC_POS_ALLOW_OFFLINE    "${NEXT_PUBLIC_POS_ALLOW_OFFLINE:-true}"

echo "=== .env ready (diff vs backup) ==="
diff -u .env.bak .env || true
echo "==================================="

export CI=1
corepack enable >/dev/null 2>&1 || true
pnpm -v || npm -v || true
jq -r .packageManager package.json 2>/dev/null || true

pnpm i --frozen-lockfile || pnpm i
pnpm -w prisma generate
pnpm -w prisma migrate dev -n pos-go-live || pnpm -w prisma db push

pnpm -w typecheck
pnpm -w lint

(pnpm -w test -- --run || true) | tee /tmp/pos_tests.log >/dev/null
(pnpm -w gates:all || true)      | tee /tmp/pos_gates.log >/dev/null

BASE="${APP_BASE_URL:-http://localhost:3000}"
echo "-- Probing server at $BASE --"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE" || true)
if [ "$HTTP" != "200" ] && [ "$HTTP" != "302" ]; then
  echo "Starting dev server..."
  pkill -f "apps/web.*next" >/dev/null 2>&1 || true
  pnpm --filter web dev >/tmp/pos-dev.log 2>&1 &
  for i in {1..60}; do
    sleep 1
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE" || true)
    [ "$HTTP" = "200" ] || [ "$HTTP" = "302" ] && break
  done
fi

echo "-- Checking POS endpoints --"
for ep in \
  "/api/pos/ensure-store" \
  "/api/pos/seed-products" \
  "/api/pos/sale" \
  "/api/pos/sale/pay" \
  "/api/pos/refund" \
  "/api/pos/receipt" \
  "/api/pos/receipt.pdf" \
  "/api/pos/stripe/webhook" \
; do
  printf "%-28s => " "$ep"
  curl -s -o /dev/null -w "%{http_code}\n" "$BASE$ep" || true
done

echo "-- Creating a sample sale + pay (cash) --"
STORE_ID=$(curl -s -X POST "$BASE/api/pos/ensure-store" -H 'content-type: application/json' -H 'x-role: admin' -d '{}' | jq -r .store.id)
PAYLOAD=$(jq -n --arg sid "$STORE_ID" '{tenantId:"t1",storeId:$sid,cashierUserId:"u1",currency:"GBP",lines:[{sku:"SKU-001",name:"Coffee 250ml",qty:1,unitPriceMinor:250,taxRate:0.2}]}')
SALE=$(curl -s -X POST "$BASE/api/pos/sale" -H 'content-type: application/json' -H 'x-role: user' -d "$PAYLOAD")
SALE_ID=$(echo "$SALE" | jq -r .sale.id)
TOTAL=$(echo "$SALE" | jq -r .sale.total)
printf "SALE_ID=%s TOTAL=%s\n" "$SALE_ID" "$TOTAL"
PAY=$(jq -n --arg id "$SALE_ID" --argjson amt "$TOTAL" '{tenantId:"t1",saleId:$id,method:"CASH",amountMinor:$amt}')
curl -s -X POST "$BASE/api/pos/sale/pay" -H 'content-type: application/json' -H 'x-role: user' -d "$PAY" | jq -c '{ok,sale:{status}}' || true

echo "-- Webhook dry run with mock signature --"
export BODY='{"id":"evt_test","type":"payment_intent.succeeded","data":{"object":{"id":"pi_test","amount_received":250}}}'
SIG=$(node - <<'NODE'
const crypto=require('crypto');
const body=process.env.BODY||'';
const secret=process.env.STRIPE_WEBHOOK_SECRET||'whsec_REPLACE_ME';
process.stdout.write(crypto.createHmac('sha256', secret).update(body).digest('hex'));
NODE
)
curl -s -X POST "$BASE/api/pos/stripe/webhook" -H "stripe-signature: $SIG" -d "$BODY" | jq -c '.' || true

TS=$(date +%Y%m%d%H%M%S)
OUT="reports/pos-go-live-$TS.md"
mkdir -p reports
cat > "$OUT" <<EOF
# POS Go-Live Snapshot ($TS)

## Env
- APP_BASE_URL: $BASE
- POS_POSTING_ENABLED: $(grep -E '^POS_POSTING_ENABLED=' .env | cut -d= -f2-)
- POS_PRINTER_MODE: $(grep -E '^POS_PRINTER_MODE=' .env | cut -d= -f2-)

## Stripe (configure real values in production)
- STRIPE_PUBLISHABLE_KEY: $(grep -E '^STRIPE_PUBLISHABLE_KEY=' .env | cut -d= -f2-)
- STRIPE_WEBHOOK_SECRET:  $(grep -E '^STRIPE_WEBHOOK_SECRET=' .env | cut -d= -f2-)
- Dashboard webhook URL:  $BASE/api/pos/stripe/webhook

## Quality
- Typecheck/Lint: completed
- Tests summary: $(rg -n "Failed|passed" -S /tmp/pos_tests.log | tail -n 1 || echo "N/A")
- Gates summary:  $(tail -n 2 /tmp/pos_gates.log 2>/dev/null || echo "N/A")

## Next steps
1) Set real Stripe keys & webhook secret in .env.
2) In Stripe Dashboard, add webhook: $BASE/api/pos/stripe/webhook.
3) For network printer: set POS_PRINTER_MODE=network, POS_PRINTER_HOST, POS_PRINTER_PORT=9100.
4) Run UAT on /pos and /pos/admin.
EOF

echo "=== POS go-live snapshot saved: $OUT ==="


