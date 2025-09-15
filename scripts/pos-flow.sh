#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000"

printf "== Ensure store ==\n"
STORE_JSON=$(curl -sS -X POST "$BASE/api/pos/ensure-store" -H 'content-type: application/json' -H 'x-role: admin' -d '{}')
STORE_ID=$(printf '%s' "$STORE_JSON" | jq -r .store.id 2>/dev/null || true)
printf 'STORE_ID=%s\n' "${STORE_ID:-}"

printf "\n== Seed products ==\n"
curl -sS -X POST "$BASE/api/pos/seed-products" -H 'content-type: application/json' -H 'x-role: admin' -d '{}' | jq -c '.' || true

if [ -z "${STORE_ID:-}" ] || [ "$STORE_ID" = "null" ]; then
  echo "Store ID missing. Exiting." >&2
  exit 1
fi

printf "\n== Create sale ==\n"
SALE_PAYLOAD=$(jq -nc --arg sid "$STORE_ID" '{tenantId:"t1",storeId:$sid,cashierUserId:"u1",currency:"GBP",lines:[{sku:"SKU-001",name:"Coffee 250ml",qty:1,unitPriceMinor:250,taxRate:0.2}]}')
SALE_JSON=$(curl -sS -X POST "$BASE/api/pos/sale" -H 'content-type: application/json' -H 'x-role: user' -d "$SALE_PAYLOAD")
printf '%s' "$SALE_JSON" | jq -c '.' || true
SALE_ID=$(printf '%s' "$SALE_JSON" | jq -r .sale.id)
TOTAL=$(printf '%s' "$SALE_JSON" | jq -r .sale.total)
printf 'SALE_ID=%s TOTAL=%s\n' "$SALE_ID" "$TOTAL"

printf "\n== Pay sale (cash) ==\n"
PAYLOAD=$(jq -nc --arg id "$SALE_ID" --argjson amt "$TOTAL" '{tenantId:"t1",saleId:$id,method:"CASH",amountMinor:$amt}')
PAY_JSON=$(curl -sS -X POST "$BASE/api/pos/sale/pay" -H 'content-type: application/json' -H 'x-role: user' -d "$PAYLOAD")
printf '%s' "$PAY_JSON" | jq -c '{ok,sale:{status}}' || true

printf "\n== Receipt PDF status ==\n"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/pos/receipt.pdf?saleId=$SALE_ID")
printf 'receipt.pdf HTTP %s\n' "$HTTP"
