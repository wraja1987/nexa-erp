# Phase 21 — Scenario-Based Seeding

**Last updated**: 2025-11-16

## Purpose

Implement scenario-based seeding for four tenant types (Manufacturing, Retail, Consulting, Healthcare) to populate realistic demo data across all modules backed by real Prisma models.

## Who Should Read This

- Developers implementing seeding scripts
- QA engineers testing scenarios
- Product managers reviewing demo data coverage

## Constraints

### Schema Lock
- **`prisma/schema.prisma` is READ-ONLY** — no schema changes allowed
- All seeding uses existing Prisma models only
- Features requiring missing models are documented as gaps

### Idempotency
- Running the same scenario seed multiple times must not duplicate tenants or data
- Use deterministic codes (e.g., `MFG-1000`, `RTL-1000`) and upsert patterns
- Do not call `deleteMany` on core tables outside the reset engine

### Environment Safety
- Never run on production without explicit environment guards
- Requires `NEXA_ALLOW_SCENARIO_SEED=true`
- Requires `NODE_ENV !== "production"`
- Checks `DATABASE_URL` for production markers

### No In-Memory/File Stores
- All seeding uses Postgres via Prisma
- No JSON/file/in-memory "databases"

---

## Scenario Tenants

### 1. Manufacturing (`SCN_MANUFACTURING`)

**Tenant Name**: "Nexa Manufacturing Demo"  
**Slug/Code**: `SCN_MANUFACTURING`

**Modules Populated**:
- **Finance**: CoA (MANUFACTURING_BASE template), opening balances, customer invoices for manufactured goods, GL entries
- **Banking**: Bank accounts, statement lines
- **Inventory/WMS**: Warehouses (MFG-WH-01, MFG-WH-02), bins for raw materials vs finished goods, items (RM-STEEL, RM-PLASTIC, FG-PUMP, FG-MOTOR), stock lots with quantities
- **Manufacturing**: BOMs for FG-PUMP, FG-MOTOR using BomItem, WorkOrders (open and completed), RoutingStep entries
- **Purchasing**: Suppliers for raw materials, PurchaseOrders (draft and approved), PoLine entries
- **HR/Payroll**: Employees as production staff, PaySchedule, PayrollRun, Payslip entries

**Data Shape**:
- Raw materials: `RM-STEEL`, `RM-PLASTIC` (in raw materials warehouse/bin)
- Finished goods: `FG-PUMP`, `FG-MOTOR` (in finished goods warehouse/bin)
- BOMs: FG-PUMP uses RM-STEEL + RM-PLASTIC
- WorkOrders: 2-3 open, 2-3 completed, aligned with stock + BOM

**Known Gaps**:
- No CRM models (Customer model missing) — using string `customerId` in CustomerInvoice
- No full Projects/PSA models — only indirect support via timesheet-like JournalEntries
- No Attachment model — attachment service returns `supported:false`

---

### 2. Retail (`SCN_RETAIL`)

**Tenant Name**: "Nexa Retail Demo"  
**Slug/Code**: `SCN_RETAIL`

**Modules Populated**:
- **Finance**: CoA (RETAIL_BASE template), sales invoices for retail customers, GL entries
- **Banking**: Bank accounts, statement lines
- **Inventory/WMS**: 1-2 warehouses with retail store bins, items (SKU-TSHIRT, SKU-JEANS, etc.), stock seeded
- **POS**: Uses CustomerInvoice and CustomerPayment to mimic POS sales, Store, TillShift, PosSale, PosLine, PosPayment entries
- **Purchasing**: Suppliers and PurchaseOrders for merchandise, PoLine entries
- **Analytics**: KPI endpoints have non-empty data (KpiSnapshot entries)

**Data Shape**:
- Items: `SKU-TSHIRT`, `SKU-JEANS`, `SKU-SHOES`, `SKU-HAT`
- POS sales: Multiple PosSale entries with PosPayment (card/cash)
- Cash-up analytics: TillShift entries with opening/closing floats

**Known Gaps**:
- No CRM models — using string `customerId` in CustomerInvoice
- No full POS session models — using PosSale/TillShift scaffolding
- No Attachment model — attachment service returns `supported:false`

---

### 3. Consulting (`SCN_CONSULTING`)

**Tenant Name**: "Nexa Consulting Demo"  
**Slug/Code**: `SCN_CONSULTING`

**Modules Populated**:
- **Finance**: CoA (UK_SMALL_SERVICE template), customer invoices with CONSULTING-FEE entries, time/billing-like JournalEntries
- **Banking**: Bank accounts, statement lines
- **HR/Payroll**: Employees as consultants, PaySchedule, PayrollRun, Payslip entries
- **Analytics**: KPI endpoints have non-empty data

**Data Shape**:
- Invoices: Service-based invoices (CONSULTING-FEE, PROJECT-FEE)
- JournalEntries: Time/billing entries (within current schema limits)
- Employees: Consultant roles

**Known Gaps**:
- No Projects/PSA models — only indirect support via timesheet-like JournalEntries
- No CRM models — using string `customerId` in CustomerInvoice
- No Attachment model — attachment service returns `supported:false`

---

### 4. Healthcare (`SCN_HEALTHCARE`)

**Tenant Name**: "Nexa Healthcare Demo"  
**Slug/Code**: `SCN_HEALTHCARE`

**Modules Populated**:
- **Finance**: CoA (GP_PRACTICE template), invoices reflecting practice billing, NHS income accounts
- **Banking**: Bank accounts, statement lines
- **HR/Payroll**: Employees representing GPs, nurses, admin staff, PaySchedule, PayrollRun (1-2 months), Payslip entries
- **Healthcare**: Uses existing healthcare reporting code; feeds `getHealthcareOverview` with employees/payroll data

**Data Shape**:
- Employees: GPs (role: GP), nurses (role: NURSE), admin (role: ADMIN)
- Payroll runs: 1-2 months of historical data
- Invoices: Practice billing where possible

**Known Gaps**:
- No full Healthcare models — using existing Phase 14 scaffolding
- No CRM models — using string `customerId` in CustomerInvoice
- No Attachment model — attachment service returns `supported:false`

---

## Seedable Models Inventory

### Finance
- ✅ `Account` — Chart of accounts (via CoA templates)
- ✅ `JournalEntry` — GL entries
- ✅ `JournalLine` — Journal entry lines
- ✅ `CustomerInvoice` — Customer invoices (uses string `customerId`)
- ✅ `SupplierBill` — Supplier bills
- ✅ `CustomerPayment` — AR payments
- ✅ `SupplierPayment` — AP payments
- ✅ `TreasuryMovement` — Cash movements
- ✅ `KpiSnapshot` — KPI snapshots for analytics
- ✅ `FixedAsset` — Fixed assets
- ✅ `DepreciationSchedule` — Depreciation schedules
- ✅ `BankAccount` — Bank accounts
- ✅ `BankStatementLine` — Bank statement lines
- ✅ `BankReconciliation` — Bank reconciliations

### Inventory/WMS
- ✅ `Warehouse` — Warehouses
- ✅ `Location` — Bins/locations
- ✅ `InventoryItem` — Item-at-location balances
- ✅ `InventoryLot` — Lot/batch level tracking
- ✅ `Asn` — Advance shipment notices
- ✅ `Wave` — WMS waves
- ✅ `PickTask` — Pick tasks

### Manufacturing
- ✅ `WorkOrder` — Work orders
- ✅ `BomItem` — Bill of materials
- ✅ `RoutingStep` — Routing steps
- ✅ `MrpPlan` — MRP plans
- ✅ `CapacityCalendar` — Capacity calendar

### Purchasing
- ✅ `Supplier` — Suppliers
- ✅ `PurchaseOrder` — Purchase orders
- ✅ `PoLine` — PO lines

### HR/Payroll
- ✅ `Employee` — Employees
- ✅ `PaySchedule` — Pay schedules
- ✅ `PayrollRun` — Payroll runs
- ✅ `Payslip` — Payslips
- ✅ `Deduction` — Deductions
- ✅ `Allowance` — Allowances

### POS
- ✅ `Store` — Stores
- ✅ `TillShift` — Till shifts
- ✅ `PosSale` — POS sales
- ✅ `PosLine` — POS sale lines
- ✅ `PosPayment` — POS payments
- ✅ `PosRefund` — POS refunds
- ✅ `PosEvent` — POS events

### Tax
- ✅ `VatReturn` — VAT returns (if usable)

### Other
- ✅ `Tenant` — Tenant rows
- ✅ `Entity` — Legal entities
- ✅ `User` — Users (for scenario tenants)
- ✅ `AuditLog` — Audit logs

### Not Seedable (Missing Models)
- ❌ `Attachment` — Model missing (Phase 16 returns `supported:false`)
- ❌ `OutboxEvent` — Model missing (Phase 18 returns `supported:false`)
- ❌ `TenantKey` — Model missing (Phase 19 returns `supported:false`)
- ❌ `TenantConfig` — Model missing (Phase 19 returns `supported:false`)
- ❌ CRM models — Customer, Contact, Opportunity models missing
- ❌ Full Projects/PSA models — Project, Task, Timesheet models missing

---

## Events, AI, and Attachments (Best-Effort)

### Events (Phase 18)
- Seeding uses existing services (not raw table writes) where practical
- Events fire through real paths:
  - Finance invoice creation → `finance.invoice.created`
  - Payroll run commit → `hr.payroll.run.committed`
  - Inventory transfers → `inventory.transfer.created`
  - Purchase order approvals → `purchasing.po.approved`
  - POS cashup preview → `pos.cashup.previewed`

### AI Logs (Phase 12)
- For each scenario, run AI tasks once after data seed:
  - Finance reconciliation
  - GL anomalies
  - Inventory anomalies
  - Payroll anomalies
  - Management commentary
- Populates existing AI telemetry mechanism (if AI configured)
- Degrades cleanly if no AI key

### Attachments (Phase 16)
- Use attachment service from Phase 16
- If Attachment model missing, call `list/presign` to verify `supported:false` responses
- Document in this doc — do not attempt synthetic DB attachment records

---

## Tenant Reset Engine

### Purpose
Ability to reset a single scenario tenant cleanly without destructive global operations.

### Behavior
- Env guards: same as seeding (no production; `NEXA_ALLOW_SCENARIO_RESET=true`)
- Input: scenario key (manufacturing, retail, consulting, healthcare) via CLI arg
- Resolve scenario tenant via `ensureScenarioTenant` (read-only; don't create new on reset)
- For that `tenantId` only, `deleteMany` from rows that can be safely re-created:
  - `JournalEntry`, `JournalLine`
  - `CustomerInvoice`, `SupplierBill`
  - `CustomerPayment`, `SupplierPayment`
  - `InventoryItem`, `InventoryLot`
  - `Warehouse`, `Location`
  - `BomItem`, `WorkOrder`, `RoutingStep`
  - `Supplier`, `PurchaseOrder`, `PoLine`
  - `Employee`, `PayrollRun`, `Payslip`, `Deduction`, `Allowance`
  - `BankAccount`, `BankStatementLine`
  - `PosSale`, `PosLine`, `PosPayment`, `PosRefund`, `PosEvent`, `TillShift`, `Store`
  - `KpiSnapshot`
- Do not touch:
  - `Tenant` rows
  - `User` rows (keep auth)
  - `Account` rows (keep CoA)
  - `Entity` rows
- After reset, optionally re-run scenario seed (`--reseed` flag)

---

## Scripts

### Base Runner
- `scripts/seed/seed-scenario-base.ts` — shared base logic, env guards, `runScenarioSeed()` function

### Scenario Scripts
- `scripts/seed/seed-scenario-manufacturing.ts`
- `scripts/seed/seed-scenario-retail.ts`
- `scripts/seed/seed-scenario-consulting.ts`
- `scripts/seed/seed-scenario-healthcare.ts`

### Reset Engine
- `scripts/seed/reset-scenario-tenant.ts`

### Package Scripts
```json
{
  "seed:scenario:manufacturing": "tsx scripts/seed/seed-scenario-manufacturing.ts",
  "seed:scenario:retail": "tsx scripts/seed/seed-scenario-retail.ts",
  "seed:scenario:consulting": "tsx scripts/seed/seed-scenario-consulting.ts",
  "seed:scenario:healthcare": "tsx scripts/seed/seed-scenario-healthcare.ts",
  "seed:scenario": "pnpm seed:scenario:manufacturing && pnpm seed:scenario:retail && pnpm seed:scenario:consulting && pnpm seed:scenario:healthcare",
  "seed:scenario:reset": "tsx scripts/seed/reset-scenario-tenant.ts"
}
```

---

## Testing

### Unit Tests
- `apps/web/src/server/seeding/__tests__/scenario-seeding.spec.ts`
- Tests:
  - `ensureScenarioTenant` returns same tenantId when called twice (idempotent)
  - Each scenario seed function inserts expected minimum rows when run against empty DB
  - Does not explode if run twice (no duplicate tenant rows; counts stable)

### Test Requirements
- Use test DB or in-memory Prisma connection pattern consistent with existing tests
- Do not require real AI/attachments backends

---

## Verification

### Build Verification
```bash
pnpm -w typecheck
DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.local)" pnpm -w build
pnpm -w lint  # expect only known non-blocking resolver issue
```

### Manual Sanity (Non-Production DB Only)
```bash
export NEXA_ALLOW_SCENARIO_SEED=true
pnpm seed:scenario:manufacturing
pnpm seed:scenario:retail
pnpm seed:scenario:consulting
pnpm seed:scenario:healthcare
```

### UI/API Checks
- Finance KPIs and reports show non-empty data for scenario tenants
- Inventory, Manufacturing, Purchasing, HR/Payroll, POS, Analytics, Healthcare pages show seeded data
- Event-driven pages (where implemented) see events

---

## Notes

- All implementations are **schema-safe** and **backwards-compatible**
- Features return `supported:false` or "UNKNOWN" when schema/infrastructure is missing
- Code is ready to activate when schema migrations are applied
- Seeding uses existing CoA templates from `apps/web/src/server/admin/coa-templates.ts`

