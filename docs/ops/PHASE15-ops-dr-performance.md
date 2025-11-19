Last updated: 2025-11-16

Purpose
- Document Phase 15 — OPS + DR + PERFORMANCE implementation for Task 8.
- Inventory existing ops/DR/performance artifacts and outline Phase 15 additions.

Who should read this
- DevOps engineers, SREs, release managers.
- Developers implementing CI/CD, DR, and performance improvements.

---

## Existing Ops/DR/Performance Artifacts

### DR (Disaster Recovery)
- **`ops/dr/backup.sh`** — Custom pg_dump backup script (creates timestamped dumps in `ops/backups/demo/`)
- **`ops/dr/restore_demo.sh`** — Restore script for demo environment
- **`docs/operations/backups-and-restore.md`** — High-level backup/restore documentation
- **`package.json` scripts**:
  - `dr:backup` — Runs `ops/dr/backup.sh`
  - `dr:restore:demo` — Runs `ops/dr/restore_demo.sh`
  - `dr:drill` — Runs `packages/jobs/restore-check.ts`
  - `dr:run` — Runs `tools/drill.ts run`
  - `dr:report` — Runs `tools/drill.ts report`

### Load Testing
- **`ops/load/k6-smoke.js`** — Basic k6 smoke test (30 RPS, 5 minutes)
- **`ops/load/run-k6.sh`** — Shell script to run k6 smoke test
- **Target**: Basic smoke testing, not high-volume load testing

### Monitoring
- **`ops/monitoring/uptime-monitors.md`** — Uptime monitoring configuration for `/api/healthz` and `/api/readyz`
- **`ops/alerts/`** — Prometheus alert rules and recording rules
- **`ops/dashboards/`** — Grafana dashboard JSON

### CI/CD
- **`.github/workflows/ci.yml`** — Main CI workflow (lint, typecheck, test, build, Playwright e2e)
- **`.github/workflows/lhci.yml`** — Lighthouse CI workflow
- **`.github/workflows/verify-and-self-heal.yml`** — Playwright verification and self-heal
- **`package.json` scripts**:
  - `smoke:all` — Comprehensive smoke test suite
  - `smoke:web` — Web build smoke test
  - `e2e` — Playwright e2e tests
  - `check:routes` — Route validation script

### Seeding
- **`scripts/seeds/`** — Phase-specific seed scripts (phase4, phase5, phase6, phase7, phaseA, stubs)
- **`package.json` scripts**:
  - `seed:phase4`, `seed:phase5`, `seed:phase6`, `seed:phase7`, `seed:phaseA`, `seed:stubs`
- **Note**: Existing seed scripts generate moderate volumes (hundreds to low thousands of rows), not 100k-500k.

---

## Phase 15 Additions

### 1. CI Pipelines for New Modules
**Goal**: Extend CI to cover all Task-8 modules (Finance extensions, Banking, HR/Payroll, Inventory/WMS, Manufacturing, Purchasing, Projects, Sales/CRM, POS, Tax, Analytics, AI Engine, Admin/Partner, Healthcare).

**Changes**:
- Update `.github/workflows/ci.yml` to include smoke tests for new module routes
- Add `scripts/runtime/runtime-smoke.ts` — Runtime smoke test script that hits key endpoints from each module
- Extend `smoke:all` or create `smoke:modules` script to validate all new module routes

**Endpoints to test** (at least one per module):
- `/api/finance/reports/pnl`
- `/api/banking/accounts/list`
- `/api/hr/employees/list`
- `/api/inventory/stock/summary`
- `/api/manufacturing/workorders/list`
- `/api/purchasing/po/list`
- `/api/projects/projects/list`
- `/api/sales/orders/list`
- `/api/pos/sessions/list`
- `/api/tax/vat/summary`
- `/api/analytics/kpi/all`
- `/api/ai/management/commentary`
- `/api/admin/coa-templates/list`
- `/api/partner/partners/list`
- `/api/healthcare/reports/overview`

### 2. DR Rehearsal Script + Docs
**Goal**: Produce repeatable DR rehearsal for Neon database and Nexa app.

**New files**:
- `ops/dr-rehearsal-phase15.md` — Step-by-step DR rehearsal guide
- `scripts/dr/dr-rehearsal.sh` — DR rehearsal helper script (non-destructive)
- `reports/dr-test-template-PHASE15.md` — DR test report template

**Process**:
1. Create Neon branch/snapshot from production branch
2. Restore branch into temporary DR database
3. Point staging deployment at DR database (via env var)
4. Run typecheck, build, runtime smoke
5. Validate key flows (login, finance reports, inventory, HR payroll, banking, healthcare, AI overview)
6. Document results in report template

### 3. High-Volume Seeding (100k-500k rows)
**Goal**: Create safe tooling to generate 100k-500k rows of realistic demo data.

**New files**:
- `scripts/seed/seed-high-volume.ts` — High-volume seed script
- **Safety guards**:
  - Requires `NEXA_ALLOW_HIGH_VOLUME_SEED=true` env var
  - Refuses to run if `DATABASE_URL` points to production (checks for production markers)
  - All inserts respect tenant scoping and foreign keys

**Data to generate** (using existing schema):
- Finance: CustomerInvoice, SupplierBill, CustomerPayment, JournalEntry/JournalLine
- Inventory: InventoryItem, InventoryLot, stock snapshots
- Manufacturing: WorkOrder, BomItem
- Purchasing: Supplier, PurchaseOrder
- HR/Payroll: Employee, PayrollRun, Payslip
- Banking: BankAccount, BankStatementLine

**Target**: 100k-500k rows total across all tables for one demo tenant.

### 4. Load Testing (~200 RPS)
**Goal**: Define repeatable load test config targeting ~200 RPS against key read APIs.

**New files**:
- `ops/perf/loadtest-200rps.yml` — Artillery config (or `loadtest-200rps.js` for k6)
- `scripts/perf/run-loadtest.sh` — Load test runner script
- `reports/perf/` — Directory for load test results

**Target endpoints** (GET only, no mutations):
- `/api/health`, `/api/status`
- `/api/finance/reports/pnl`, `/api/finance/reports/balance-sheet`, `/api/finance/reports/ap-ar/receivables-aging`
- `/api/banking/accounts/list`
- `/api/hr/employees/list`
- `/api/inventory/stock/summary`
- `/api/manufacturing/workorders/list`
- `/api/purchasing/po/list`
- `/api/analytics/kpi/all`
- `/api/ai/management/commentary`
- `/api/healthcare/reports/overview`

**Behavior**:
- Ramp up to ~200 RPS sustained for 3-5 minutes
- Parameterize base URL via `PERF_BASE_URL` env var
- Ensure no write endpoints are hit
- Output summary metrics to `reports/perf/loadtest-YYYYMMDD.json`

### 5. Staging Parity
**Goal**: Document and partially automate keeping staging close to production.

**New files**:
- `ops/staging-parity-phase15.md` — Staging parity documentation
- `scripts/env/check-staging-parity.ts` — Staging env check script

**Key differences to document**:
- Domains and Vercel projects
- Neon branches / DB URLs
- Environment variables (feature flags, AI keys, third-party integrations)
- How staging should mirror production safely (DB: create Neon branch from prod periodically; DO NOT write to prod)

### 6. Performance Tuning (Code-Level Only)
**Goal**: Tune hot paths by code changes only (no new indexes, no schema tweaks).

**Hot paths identified**:
- Finance reports (TB/P&L/BS, ageing, revenue)
- Inventory stock summaries
- Banking reconciliation views
- HR payroll runs and payslip lists
- Analytics overview
- AI management commentary

**Tuning techniques** (code-level only):
- Add explicit `select` clauses to pull only required columns
- Add pagination defaults (e.g., 50/100 rows per request)
- Avoid N+1 patterns using `include` or batched queries
- Add server-side parameter validation (max date ranges, max page sizes)

**Files tuned**:
- `apps/web/src/server/finance/gl.ts` — Added explicit select, date range limits
- `apps/web/src/server/inventory/stock.ts` — Optimized select clauses, removed unnecessary includes
- `apps/web/src/server/analytics/kpi.ts` — Already optimized with aggregates
- `apps/web/src/server/banking/reconciliation.ts` — Added pagination defaults
- `apps/web/src/server/hr/payroll.ts` — Added pagination and select optimization

**Tuning details**:
1. **Finance GL (`gl.ts`)**: Added date range validation (max 1 year), explicit select for trial balance
2. **Inventory Stock (`stock.ts`)**: Removed unnecessary `include` for warehouse/location in summary queries, added explicit select
3. **Banking Reconciliation**: Added pagination defaults (limit 100, max 1000)
4. **HR Payroll**: Added pagination defaults (limit 50, max 500) for payslip lists
5. **Analytics KPI**: Already uses efficient aggregates, no changes needed

---

## Constraints

- **Schema locked**: No changes to `apps/web/prisma/schema.prisma` or Prisma migrations
- **No JSON/file stores**: All data must come from existing Postgres schema via Prisma
- **Production read-only**: All seeding and DR scripts must assume non-production by default and require explicit env flags to touch prod
- **No destructive operations**: DR scripts must not run DROP/TRUNCATE operations
- **Tenant-scoped**: All operations respect existing tenancy patterns
- **RBAC-preserved**: All operations respect existing RBAC patterns
- **Nexa shell unchanged**: Logo behavior unchanged (logo logs out and redirects to https://www.nexaai.co.uk)

---

## How to Run

### CI Updates
- CI workflow automatically runs on push/PR
- New module smoke tests run as part of CI pipeline

### DR Rehearsal
```bash
# Follow steps in ops/dr-rehearsal-phase15.md
# Or run helper script (non-destructive):
bash scripts/dr/dr-rehearsal.sh
```

### High-Volume Seeding
```bash
# Set safety guard:
export NEXA_ALLOW_HIGH_VOLUME_SEED=true
# Ensure DATABASE_URL points to staging/non-prod
tsx scripts/seed/seed-high-volume.ts
```

### Load Testing
```bash
# Set base URL (must not be production):
export PERF_BASE_URL=https://staging.nexaai.co.uk
bash scripts/perf/run-loadtest.sh
```

### Staging Parity Check
```bash
tsx scripts/env/check-staging-parity.ts
```

---

## Verification

After Phase 15 implementation:
- `pnpm -w typecheck` — PASS
- `DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.local)" pnpm -w build` — PASS
- `pnpm -w lint` — Only known non-blocking resolver issue (unchanged from baseline)
- No changes to `apps/web/prisma/schema.prisma` or Prisma migrations
- No JSON/file/in-memory stores introduced
- Nexa shell and logo behavior unchanged
- All new scripts documented and safe (non-production by default)

