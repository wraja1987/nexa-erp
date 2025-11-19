Last updated: 2025-11-16

Purpose
- Define Banking + Cash Management scope using the existing schema only, and list gaps.

Available now in schema (root prisma/schema.prisma)
- BankAccount(id, tenantId, code, name, currency, createdAt, updatedAt) with unique (tenantId, code).
- BankStatementLine(id, tenantId, bankAccountId, date, description, amount, reference, reconciled, ...)
- BankReconciliation(id, tenantId, bankAccountId, fromDate, toDate, statementBal, ...)
- TreasuryMovement, CustomerPayment, SupplierPayment (for cashflow signals).

Existing endpoints/pages (baseline)
- Basic Banking page exists at `apps/web/app/(app)/finance/banking/page.tsx` (imports + reconcile triggers).
- No dedicated CRUD UI for BankAccount yet; statement import pipeline minimal.

Gaps / requires Task 2 or integration work
- Persistent linkage from bank lines to ledger/payment records for full audit (beyond boolean reconciled).
- Open Banking live connectivity (client registration, consent, tokens, webhooks).
- Robust idempotency keys and duplicate detection per-bank feed metadata (statementId/lineId hashes).
- Advanced auto‑matching (ML, memo normalisation, multi‑line allocations).

Phase 2 behaviour (implemented)
- Bank accounts: list/get/create/update (tenant‑scoped). Archive returns 501 (no status field).
- Statement import:
  - parse CSV -> preview (no persist)
  - import -> creates BankStatementLine rows under a BankAccount (upsert by code)
- Reconciliation:
  - list unreconciled bank lines
  - suggest matches by simple amount/date proximity against CustomerPayment/SupplierPayment
  - commit -> mark bank line reconciled=true (no linkage persisted; documented)
- Cash:
  - Cash position by account (sum of statement lines)
  - Short‑term cashflow forecast using open AR/AP (safe subset)
- Open Banking:
  - Docs + server scaffolding only; no outbound calls.


