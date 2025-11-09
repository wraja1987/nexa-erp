# Task 5 — Recommended Add‑ons (Pre‑Task 6)

Date: $(date)

## Proposed add‑ons

1. Finance negative‑paths (S, no schema)
   - Add tests for: re‑approve → 409, overpay → 400, duplicate reference → 409.
   - Rationale: Strengthen invariants and idempotency guarantees.

2. Inventory optimistic locking (M, no schema)
   - Add retry wrapper and test for two rapid GRNs to validate on‑hand correctness.
   - Rationale: Demonstrate resilience under concurrency.

3. Projects roll‑up idempotency window (S, no schema)
   - Add test for same window re‑rollup returns stable totals and does not duplicate KPIs.
   - Rationale: Guardrails for analytics correctness.

4. Admin UI user onboarding flow (M, no schema)
   - Add Playwright test to create STAFF via Admin UI and verify RBAC on `/finance/reports`.
   - Rationale: Prove real‑world onboarding works end‑to‑end.

5. Dev‑only diag add‑user endpoint (S, no schema)
   - Add `/api/_diag/add-user` for local E2E (NODE_ENV !== 'production').
   - Rationale: Faster local iterations; no prod exposure.

6. Rate‑limit assertions in tests (S, no schema)
   - Add tests to assert 429 under tight burst (tenant+user keyed buckets).
   - Rationale: Prevent regressions in mutating routes.

7. CSP consolidation (M, no schema)
   - Document active CSP source; consider enabling strict CSP in the active app middleware (no `'unsafe-inline'`).
   - Rationale: Clarity and defense‑in‑depth.


