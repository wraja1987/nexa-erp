Last updated: 2025-11-16

Purpose
- Establish the current FX and remeasurement capabilities on the existing schema and list gaps needing future schema work.

Available now in schema
- Entity.currencyCode — usable as functional/base currency at legal-entity level where a single entity is in scope.
- CustomerInvoice.currency, SupplierBill.currency — transaction currency at document level.
- CurrencyRate(fromCode, toCode, rate, asOfDate) — historical FX rates table for conversions at/near a date.
- JournalEntry/JournalLine (tenant-scoped) — GL for representing postings (including potential FX gains/losses) without adding new tables.

Missing; requires Task 2/schema work later
- Explicit functional currency at tenant level (if multi-entity tenant-wide reporting differs from entity currency).
- Payment currency on CustomerPayment/SupplierPayment to compute realised FX precisely.
- Per-document FX rate captured at posting time (to avoid historical drift if rates table changes).
- First-class group structures and FX translation profiles for consolidated reporting.
- Materialized FX exposure tables for performance.

Current Finance services/APIs touching FX
- Reports: /api/finance/reports/{trial-balance,pnl,balance-sheet}
- GL Post: /api/finance/gl/post
- AR/AP: /api/finance/ar/invoice/{approve,pay}

Planned behaviour (Phase 1 scope, read-only or additive logic only)
- Functional currency selection:
  - If a single legal entity is resolved, use Entity.currencyCode.
  - If multi-entity/tenant-wide, default to a safe base (GBP) and mark the scope as tenant-wide (limitations documented).
- FX rate lookup:
  - Use CurrencyRate where asOfDate <= requested date, selecting the most recent.
  - Identity rate when fromCode == toCode.
- Unrealised FX remeasurement (read-only):
  - Compute tenant-wide foreign-currency exposures where transaction currency != functional currency.
  - Report approximate functional values using the closing rate.
- Realised FX (limited):
  - Only compute when sufficient data exists (transaction currency + payment currency + relevant rates).
  - Otherwise, return a report with notes highlighting missing data.


