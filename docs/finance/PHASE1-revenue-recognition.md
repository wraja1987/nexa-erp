Last updated: 2025-11-16

Purpose
- Define what revenue recognition we can support on the existing schema, without schema changes. Clarify gaps for a future Task 2.

Available now in schema
- CustomerInvoice: tenantId, number, currency, total, issuedAt, dueAt, status
- JournalEntry/JournalLine: tenantId, postings (compatibility with recognise-at-invoice-date)
- Entity.currencyCode: usable as functional currency for simple reporting

Missing; requires Task 2/schema work later
- Revenue schedules persisted per line (start/end periods, amounts)
- Performance obligations and recognition rules per line (fixed fee, milestone, subscription, T&M)
- Contract/Project linkages with progress measures
- Deferral accounts configuration per product/line

Current behaviour implemented in Phase 1
- Recognition modes supported:
  - INSTANT: recognises at invoice date (issuedAt)
  - OVER_TIME_SIMPLE: if dueAt > issuedAt, recognises evenly over months between issuedAt and dueAt; otherwise falls back to INSTANT
- Reports:
  - /api/finance/reports/revenue/schedule — computed schedules (in‑memory)
  - /api/finance/reports/revenue/summary — per‑period recognised totals and as‑of deferred estimates
- Scoping:
  - Tenant and legal‑entity scoping enforced via existing helpers
- Notes:
  - All schedules are computed on the fly; no new tables are written
  - Where required fields are absent, logic falls back to INSTANT and documents the limitation


