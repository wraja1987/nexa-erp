#!/usr/bin/env bash
set -euo pipefail
pnpm --filter web build
pnpm --filter web start -p 3000 & PID=$!
sleep 6
urls=(
  "/login" "/dashboard"
  "/finance/invoices" "/finance/bills" "/finance/payments" "/finance/reports"
  "/inventory/items" "/inventory/stock-moves" "/inventory/purchase-orders"
  "/manufacturing/work-orders" "/manufacturing/bom"
  "/sales/leads" "/sales/opportunities" "/sales/orders"
  "/projects/boards" "/projects/tasks" "/projects/reports"
  "/hr/employees" "/hr/payroll" "/hr/leave"
  "/pos/register" "/pos/receipts" "/pos/reports"
  "/ai/documents" "/ai/insights" "/ai/settings"
)
for u in "${urls[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$u")
  echo "$code $u"
done
kill $PID


