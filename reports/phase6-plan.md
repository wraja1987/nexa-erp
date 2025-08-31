# Phase 6 Plan — Nexa ERP (Final Patched+++ Complete, Hardened, Gap-Assured)

This plan inventories existing modules and outlines minimal, non-breaking additions for Phase 6 while preserving the baseline.

## Inventory (existing in nav/routes)
- Industry Packs: Manufacturing, Construction, Logistics, Retail, Professional Services, SaaS/Tech
- AI Orchestration: Workflows, Runs, Audit Logs
- Enterprise: Entities, Intercompany, Consolidation
- Integrations: Shopify, Amazon, eBay, HMRC RTI, Open Banking, EDI, Health, Toggles
- Monitoring, Billing, Developer Portal, Settings, Help & Docs

Notes: These modules already have shell routes/pages in `apps/web/src/app/(app)/...` and appear in `apps/web/src/config/modules.ts`.

## Phase 6 adds/updates
- Seeds
  - Add `scripts/seeds/seed-phase6.ts` as deterministic, idempotent seed entrypoint.
  - Behavior: If `DATABASE_URL` unset, skip with success; otherwise perform safe upserts (later iterations).
  - Add a sanity test `scripts/tests/seed-phase6.test.ts` to assert execution succeeds without DB.
- Tests
  - Ensure Vitest discovers `apps/web/src/**/*.test.ts` (already patched).
  - Placeholder unit tests for new seed runner (done in this phase).
- Governance & Masking
  - Confirm all new code logs via `audit()` (no raw `[assistant_audit]`). No new endpoints introduced in this step; future features must import from `apps/web/src/lib/log/mask`.
- Docs & Reports
  - Leverage acceptance runner to produce `phase6-acceptance-*.md` and update `reports/INDEX.md`.

## Impacted files
- `scripts/seeds/seed-phase6.ts` (new)
- `scripts/tests/seed-phase6.test.ts` (new)
- `package.json` scripts (add `seed:phase6`)

## Out of scope (future increments in Phase 6)
- Full data models and API handlers for advanced flows (multi-entity consolidation, orchestration agents, connectors). These will be added incrementally after baseline remains green.

