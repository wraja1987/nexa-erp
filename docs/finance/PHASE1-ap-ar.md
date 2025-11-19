Last updated: 2025-11-16

Purpose
- Document current AP/AR lifecycles, endpoints, and gaps. Serve as the baseline for Task 8 — Phase 1.3 hardening without schema changes.

Available now in schema
- AR: CustomerInvoice (tenantId, number, currency, total, status, issuedAt, dueAt), CustomerPayment (tenantId, invoiceId, amount, method, reference)
- AP: SupplierBill (tenantId, number, currency, total, status, receivedAt, dueAt), SupplierPayment (tenantId, billId, amount, method, reference)
- GL: JournalEntry/JournalLine for postings
- Entity & FX: Entity.currencyCode; CurrencyRate for conversions

Missing; requires Task 2
- Per-line tax/VAT linkage; robust tax computation models
- Payment allocations per line/document with FX capture
- Credit notes as first-class models with applied-to links

Current endpoints/services
- AR
  - Approve: /api/finance/ar/invoice/approve
  - Pay: /api/finance/ar/invoice/pay
  - Reports: /api/finance/reports/{trial-balance,pnl,balance-sheet}
- AP
  - (Added in this phase) Approve: /api/finance/ap/bill/approve
  - (Added in this phase) Pay: /api/finance/ap/bill/pay
  - (Added in this phase) Aging: /api/finance/reports/ap-ar/payables-aging
- AR Aging (added): /api/finance/reports/ap-ar/receivables-aging

Lifecycles (code-level)
- AR Invoice: draft → approved → sent (optional) → part_paid → paid → (optional written_off) → void
- AP Bill: draft → approved → sent (optional) → part_paid → paid → void
- Transitions are guarded centrally in apar-lifecycle helpers.


