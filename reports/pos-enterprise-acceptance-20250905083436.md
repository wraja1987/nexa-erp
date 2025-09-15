# POS Enterprise Acceptance Report

## Summary
- Stripe live paths wired with webhook idempotency and reconciliation.
- Posting toggles enabled; inventory FIFO via `InventoryLot` and GL entries: DR Stripe Clearing, CR Revenue, CR VAT Liability; reversal on refund.
- Printer adapter: PDF with logo; optional network ESC/POS over TCP.
- UAT helpers: ensure default store; seed basic products.

## Test & Gates Results

### Unit tests

442:[2m      Tests [22m [1m[31m1 failed[39m[22m[2m | [22m[1m[32m97 passed[39m[22m[90m (98)[39m

### Gates

PASS: script present: golden:all
Phase 5 gate: OK

### Smoke





== Nexa ERP Smoke Suite Finished ==

## Manual UAT Steps
1. Open POS Admin: open shift via `/api/pos/shift/open`.
2. Ensure store: POST `/api/pos/ensure-store`.
3. Seed products: POST `/api/pos/seed-products`.
4. Create sale: POST `/api/pos/sale` with lines (SKU, qty, price).
5. Pay cash: POST `/api/pos/sale/pay` with method CASH.
6. Pay card (mock): set STRIPE_SECRET_KEY; create PI via `/api/pos/payment_intent`; pay with method CARD.
7. Refund: POST `/api/pos/refund`.
8. Print receipt: open `/api/pos/receipt.pdf?saleId=...` or set POS_PRINTER_MODE=network and confirm print.
9. Reports: run X and Z via `/api/pos/reports/x` and `/api/pos/reports/z`.

## Next Actions
- Configure Stripe Dashboard webhook in prod to `APP_BASE_URL/api/pos/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.
- Connect a real network ESC/POS printer and set `POS_PRINTER_HOST` and `POS_PRINTER_PORT`.
- Add brand receipt template and store logo/address.
