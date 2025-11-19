# Task 8 Gap Closure — Progress Report

**Date**: 2025-01-18  
**Status**: In Progress

---

## Summary

This document tracks the systematic removal of all stubs, 501 responses, and "schema gap" implementations across Task 8 phases.

---

## STEP 1 — Build/Lint Fixes ✅

### Completed
- ✅ Fixed RBAC matrix export (`export const matrix` in `apps/web/src/lib/rbac/matrix.ts`)
- ✅ Fixed DATABASE_URL build-time access (guarded Prisma client initialization)
- ✅ Added `export const dynamic = "force-dynamic"` to API routes that need it
- ✅ Changed 501 status codes to 400 for validation errors in CoA templates

### Status
- ✅ `pnpm -w typecheck` — PASSING
- ✅ `pnpm -w lint` — PASSING  
- ⚠️ `pnpm -w build` — Requires DATABASE_URL env var (expected for production builds)

---

## STEP 2 — Stub Removal Progress

### Phase 6 — Purchasing ✅
- ✅ BlanketPO, SupplierContract, LandedCost, SupplierPerformance — All DB-backed

### Phase 7 — Projects/PSA ✅
- ✅ Projects, Timesheets, Billing, Retainers, Profitability — All DB-backed

### Phase 8 — Sales + CRM ✅
- ✅ Accounts, Contacts, Activities, Opportunities, Quotes, Orders — All DB-backed

### Phase 9 — POS ✅
- ✅ Sessions, Promotions, Variance, Cash-up — All DB-backed

### Phase 10 — Tax + Compliance ✅
- ✅ VAT pipeline, HMRC MTD, GCC e-invoice, Audit pack — All DB-backed

### Phase 11 — Analytics ✅
- ✅ Metrics store, ETL jobs, KPIs — All DB-backed

### Phase 13 — Admin + Config + Partner ✅
- ✅ Localisation, Tenant management, Partners, Revenue share, Industry presets — All DB-backed

### Phase 14 — Healthcare ✅
- ✅ Practices, PCN, ARRS, Rota, Claims, Reports — All DB-backed

### Phase 16 — Attachments ✅
- ✅ Full CRUD using Attachment model — All DB-backed, no stubs

### Phase 17 — Import/Export ✅
- ✅ Customer, PriceList, SalesOrder imports — All DB-backed

### Remaining Phases (In Progress)

#### Phase 18 — Event Bus + Outbox 🔄
- ⚠️ `outboxRepository.ts` — Still has `supported:false` checks
- ⚠️ `consumerRunner.ts` — Needs DB-backed outbox polling
- ⚠️ `/api/events/list` and `/api/events/replay` — Need implementation

#### Phase 19 — BYOK + Data Residency 🔄
- ⚠️ `byokProvider.ts` — Still has `supported:false` checks
- ⚠️ `byokCrypto.ts` — Needs TenantKey model integration
- ⚠️ `dataResidency.ts` — Needs TenantConfig.region integration

#### Phase 24 — Workflow 🔄
- ⚠️ `workflow/history.ts` — Still has `supported:false` checks
- ⚠️ WorkflowDefinition/WorkflowInstance/WorkflowHistory — Need DB-backed persistence

#### Phase 25 — Custom Fields 🔄
- ⚠️ `customFields/definitionsService.ts` — Still has `supported:false` checks
- ⚠️ `customFields/valuesService.ts` — Needs CustomFieldDefinition/CustomFieldValue integration

#### Phase 26 — Planning 🔄
- ⚠️ Planning service — May have `supported:false` branches
- ⚠️ "Accept recommendation" flows — Need integration with Procurement/Manufacturing

#### Phase 27 — User Management 🔄
- ⚠️ `userManagement.ts` — May have stubs
- ⚠️ Invite flow — Needs Invite model integration
- ⚠️ Department/Team associations — Need Department model integration

#### Phase 28 — Agentic AI 🔄
- ⚠️ `ai/agent/logs.ts` — Needs AgentRun/AgentStep persistence
- ⚠️ `/api/agent/console/runs` and `/api/agent/console/steps` — Need DB-backed responses

---

## STEP 3 — Phase 23 Checks

### Status: Pending
- ⏳ `pnpm check:ui:phase23`
- ⏳ `pnpm check:route-rbac:phase23`
- ⏳ `pnpm check:events:phase23`
- ⏳ `pnpm check:ai:phase23`
- ⏳ `pnpm check:imports:phase23`
- ⏳ `pnpm check:attachments:phase23`
- ⏳ `pnpm check:observability:phase23`
- ⏳ `pnpm check:seeding:phase23`
- ⏳ `pnpm check:dr:phase23`
- ⏳ `pnpm check:static:phase23`
- ⏳ `pnpm check:all:phase23`

---

## Next Steps

1. Continue stub removal for remaining phases (18, 19, 24, 25, 26, 27, 28)
2. Run Phase 23 checks and fix any issues
3. Update acceptance documentation
4. Final verification

---

## Notes

- All Prisma schema models are in place (added in Task 8 schema extension)
- Focus is on replacing `supported:false` checks with real DB-backed implementations
- No schema changes allowed — work strictly at TypeScript/Next.js level

