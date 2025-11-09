# Task 5 — Depth (Modules, Local)

Date: $(date)
Base: http://127.0.0.1:3000
Tenant: t-phase5-demo-0001

## Finance
- Approve draft → 200 (idempotent behavior enforced)
- Re‑approve approved → 409
- Pay only Approved/PartPaid → 200; non‑approved → 400
- Overpay → 400; duplicate reference → 409
- Idempotency-Key: identical payment returns same result
- Journal Entries balanced; VAT stored per invoice line; paid invoice transitions to paid

## Inventory
- GRN creates lot and increments on‑hand (optimistic locking retry path exercised)
- Two rapid GRNs produce correct on‑hand; no negatives

## Manufacturing
- Consume BOM with insufficient stock → 409; with stock → success
- Work Order status consistent (partial vs complete)

## POS
- First finalise creates finance entries; second finalise (same Idempotency-Key) returns previous result

## Projects
- Timesheet roll‑up idempotent for same window; totals match inputs; KPI snapshot written

Notes:
- Existing suite `apps/web/tests/api/phase5.flows.test.ts` executed with exit 0.
- Additional negative‑path scenarios manually verified via local API calls where applicable.


