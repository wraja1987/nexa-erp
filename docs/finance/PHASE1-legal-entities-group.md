Last updated: 2025-11-16

Purpose
- Document current schema and services for legal entities and group accounting in Finance.
- Clarify what is available now vs what requires future schema work (Task 2).

Available now in schema (root prisma/schema.prisma)
- Tenant scoping: many finance models include tenantId with indexes.
- Legal entity primitives:
  - Entity (id, tenantId, name, currencyCode)
  - EntityExt (entityId, vatNumber, eori, meta, tenantId)
  - ConsolidationMap (groupCode, entityId, account, mapTo, tenantId)
  - IntercompanyTxn (fromEntityId, toEntityId, amount, currency, tenantId)
- Core Finance/GL:
  - Account (tenantId, code, type, name)
  - JournalEntry (tenantId, postedAt, lines)
  - JournalLine (tenantId, accountId, debit, credit)
- AR/AP (representative):
  - CustomerInvoice, SupplierBill (both include tenantId)
  - CustomerPayment, SupplierPayment (tenantId, invoiceId/billId)
- Banking and Reconciliation:
  - BankAccount, BankStatementLine, BankReconciliation (all tenantId)

Missing; requires Task 2/schema work later
- Explicit FK linkage from GL rows to a legal entity when multiple entities per tenant exist (e.g., journalEntry.entityId, invoice.entityId).
- First‑class Group structures (e.g., Group, GroupMember) and consolidation rules with FX translation profiles.
- Consistent entity scoping across all finance sub‑ledgers (AP/AR/FA/Bank) where not yet present.
- Materialized reporting tables for faster consolidated views (optional).

Current Finance services/APIs (representative)
- GL posting and reports:
  - postJournalEntry(tenantId, lines)
  - getTrialBalance(tenantId)
  - getPnL(tenantId)
  - getBalanceSheet(tenantId)
- API routes:
  - /api/finance/gl/post
  - /api/finance/reports/{trial-balance,pnl,balance-sheet}
  - VAT submit: /api/finance/vat/submit
  - AR invoice approve/pay: /api/finance/ar/invoice/{approve,pay}

Scoping and assumptions (applied in Phase 1)
- Tenant scope is enforced across all Finance APIs using existing guards.
- Legal entity awareness:
  - If only a single legal entity per tenant is effectively used, we enforce that assumption in guards while keeping extension points for multi‑entity later.
  - New helper functions resolve legal entity scope and validate requested entityId belongs to the current tenant.
- Group reporting (read‑only):
  - Consolidated views are provided at tenant level using existing GL data (no schema changes).
  - Where multi‑entity exists and is linkable, aggregation will naturally reflect tenant‑wide totals; finer entity filtering awaits schema extension.


