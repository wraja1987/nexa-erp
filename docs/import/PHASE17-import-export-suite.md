Last updated: 2025-11-16

Purpose
- Document Phase 17 — IMPORT / EXPORT SUITE implementation for Task 8.
- Inventory existing models and document schema gaps for import/export operations.

Who should read this
- Developers implementing import/export features.
- Future schema migration planners.

---

## Schema Inventory

### Existing Models

**Chart of Accounts / GL**
- ✅ `Account` — `id`, `tenantId`, `code`, `name`, `type`, `createdAt`, `updatedAt`
- ✅ `JournalEntry` — `id`, `tenantId`, `docRef`, `memo`, `postedAt`, `createdAt`, `updatedAt`
- ✅ `JournalLine` — `id`, `entryId`, `accountId`, `tenantId`, `debit`, `credit`, `createdAt`, `updatedAt`

**Trial Balance**
- ✅ `getTrialBalance()` function exists in `apps/web/src/server/finance/gl.ts`
- Returns: `{ asOf, rows: [{ code, name, type, debit, credit, balance }], totals: { debit, credit } }`

**Customers / Vendors**
- ❌ **No `Customer` model** — Only `CustomerInvoice` with `customerId` field (string, not FK)
- ✅ `Supplier` — `id`, `tenantId`, `code`, `name`, `email`, `phone`, `createdAt`, `updatedAt`

**Item Master / Price Lists**
- ✅ `InventoryItem` — `id`, `tenantId`, `sku`, `qtyOnHand`, `warehouseId`, `locationId`, `createdAt`, `updatedAt`
- ❌ **No `PriceList` model** — No price list or price book tables

**Orders**
- ✅ `PurchaseOrder` — `id`, `tenantId`, `number`, `supplierId`, `currency`, `status`, `orderDate`, `expectedAt`, `createdAt`, `updatedAt`
- ✅ `PoLine` — `id`, `poId`, `tenantId`, `lineNo`, `sku`, `qty`, `price`, `createdAt`, `updatedAt`
- ❌ **No `SalesOrder` model** — Only `CustomerInvoice` (no dedicated sales order table)
- ✅ `CustomerInvoice` — `id`, `tenantId`, `number`, `customerId` (string), `currency`, `total`, `status`, `issuedAt`, `dueAt`, `createdAt`, `updatedAt`

**Payroll**
- ✅ `Employee` — `id`, `tenantId`, `empNo`, `firstName`, `lastName`, `email`, `createdAt`, `updatedAt`
- ✅ `PayrollRun` — `id`, `tenantId`, `scheduleId`, `periodStart`, `periodEnd`, `status`, `createdAt`, `updatedAt`
- ✅ `Payslip` — `id`, `tenantId`, `runId`, `employeeId`, `grossPay`, `netPay`, `createdAt`, `updatedAt`

**Import Job Storage**
- ❌ **No dedicated `ImportJob` model** — `NotificationJob` exists but is tied to `NotificationTemplate`, not suitable for import jobs
- ✅ `AuditLog` — Can log import operations but cannot store job state/undo info

---

## Feature Matrix

### Opening Balances

**Status**: ✅ **PARTIALLY SUPPORTED**

**What Works**:
- Can post opening balances as `JournalEntry` / `JournalLine` records
- Uses existing `Account` model (must exist or be created)
- Tenant-scoped via `tenantId` on JournalEntry/JournalLine

**Schema Gaps**:
- No explicit "Opening Balances" batch marker (can use `docRef` field)
- No date filtering on trial balance (all journal lines included)

**Implementation**:
- `previewOpeningBalancesImport()` — Validates CSV, checks account existence, validates sums
- `applyOpeningBalancesImport()` — Creates JournalEntry with `docRef="OPENING_BALANCES"` and JournalLines
- Returns `supported:false` if Account or JournalEntry models are missing

---

### Trial Balance Export

**Status**: ✅ **SUPPORTED**

**What Works**:
- Uses existing `getTrialBalance()` function
- Exports to CSV format: `Code,Name,Type,Debit,Credit,Balance`

**Implementation**:
- `exportTrialBalanceCsv()` — Calls `getTrialBalance()`, formats as CSV

---

### COA (Chart of Accounts) Export/Import

**Status**: ✅ **SUPPORTED**

**What Works**:
- Export: Uses `Account` model, exports `Code,Name,Type,Currency,ParentCode,Active`
- Import: Upserts accounts by `code` (does not delete existing accounts)
- Only updates `name` and `active` flag if account exists

**Schema Gaps**:
- No `parentCode` field on Account (will be ignored on import)
- No `currency` field on Account (will be ignored on import)
- No `active` field on Account (will be ignored on import)

**Implementation**:
- `exportCoaCsv()` — Exports all accounts for tenant
- `previewCoaImport()` — Validates CSV, checks for duplicates
- `applyCoaImport()` — Upserts accounts (create if missing, update name if exists)
- Returns `supported:false` if Account model is missing

---

### Customer/Vendor Imports

**Status**: ⚠️ **PARTIALLY SUPPORTED**

**Customers**:
- ❌ **No `Customer` model** — Only `CustomerInvoice` with `customerId` string field
- Returns `supported:false` with "schema gap: no Customer model"

**Vendors**:
- ✅ **`Supplier` model exists** — Can import suppliers
- Import: Upserts by `code` (create if missing, update name/email/phone if exists)

**Implementation**:
- `previewCustomerImport()` — Returns `supported:false` (no Customer model)
- `applyCustomerImport()` — Returns 501 (no Customer model)
- `previewVendorImport()` — Validates CSV, checks for duplicates
- `applyVendorImport()` — Upserts suppliers
- Returns `supported:false` if Supplier model is missing

---

### Item Master Import

**Status**: ✅ **SUPPORTED**

**What Works**:
- Uses `InventoryItem` model
- Import: Upserts by `sku` (create if missing, update qtyOnHand if exists)

**Schema Gaps**:
- No `name` or `description` fields on InventoryItem (only `sku`, `qtyOnHand`, `warehouseId`, `locationId`)
- Warehouse/location must exist or be created separately

**Implementation**:
- `previewItemImport()` — Validates CSV, checks warehouse/location existence
- `applyItemImport()` — Upserts inventory items
- Returns `supported:false` if InventoryItem model is missing

---

### Price List Import

**Status**: ❌ **NOT SUPPORTED**

**Schema Gaps**:
- No `PriceList` or `PriceBook` model
- No price list storage mechanism

**Implementation**:
- `previewPriceListImport()` — Returns `supported:false` with "schema gap: no PriceList model"
- `applyPriceListImport()` — Returns 501

---

### PO (Purchase Order) Import

**Status**: ✅ **SUPPORTED**

**What Works**:
- Uses `PurchaseOrder` and `PoLine` models
- Import: Creates new PO in `draft` status
- Validates supplier existence, SKU existence

**Schema Gaps**:
- No explicit "imported" marker (can use `memo` field)

**Implementation**:
- `previewPurchaseOrderImport()` — Validates CSV, checks supplier/SKU existence
- `applyPurchaseOrderImport()` — Creates PurchaseOrder + PoLine records in `draft` status
- Returns `supported:false` if PurchaseOrder/PoLine models are missing

---

### SO (Sales Order) Import

**Status**: ❌ **NOT SUPPORTED**

**Schema Gaps**:
- No `SalesOrder` model — Only `CustomerInvoice` exists
- Cannot import sales orders without dedicated model

**Implementation**:
- `previewSalesOrderImport()` — Returns `supported:false` with "schema gap: no SalesOrder model"
- `applySalesOrderImport()` — Returns 501

---

### Payroll Import

**Status**: ✅ **PARTIALLY SUPPORTED**

**What Works**:
- Uses `Employee`, `PayrollRun`, `Payslip` models
- Import: Creates draft payroll runs and payslips
- Never auto-posts GL or submits to HMRC

**Schema Gaps**:
- No explicit "imported" marker (can use `memo` on PayrollRun if available)

**Implementation**:
- `previewPayrollImport()` — Validates CSV, checks employee existence
- `applyPayrollImport()` — Creates PayrollRun + Payslip records in `draft`/`calculated` status
- Returns `supported:false` if Employee/PayrollRun/Payslip models are missing

---

## Validation + Undo Model

### Validation Engine

**Implementation**: `apps/web/src/server/imports/validation.ts`

**Features**:
- Row-level validation (required fields, data types, format checks)
- Reference validation (account codes, supplier codes, SKUs must exist)
- Business rule validation (opening balances must balance, PO totals must match lines)
- Returns structured errors: `{ row: number; field?: string; message: string }`

**Supported Validators**:
- `validateOpeningBalanceRows()` — Checks account codes, debit/credit sums balance
- `validateCoaRows()` — Checks code uniqueness, valid account types
- `validateVendorRows()` — Checks code uniqueness, valid email/phone formats
- `validateItemRows()` — Checks SKU uniqueness, warehouse/location existence
- `validatePurchaseOrderRows()` — Checks supplier existence, SKU existence, line totals
- `validatePayrollRows()` — Checks employee existence, valid pay amounts

### Undo/Rollback Model

**Status**: ❌ **NOT FULLY SUPPORTED** (schema gap)

**Schema Gap**:
- No `ImportJob` model to store job metadata and undo tokens
- Cannot persist import job state or undo information

**Implementation** (Schema-Safe Stub):
- `createImportJob()` — Returns `supported:false` (no job storage)
- `registerUndoToken()` — Returns `supported:false` (no undo storage)
- `getUndoInfo()` — Returns `supported:false` (no undo storage)
- `previewUndo()` — Returns `supported:false` with "schema gap: no ImportJob model"
- `applyUndo()` — Returns 501

**Future Schema Requirements**:
```prisma
model ImportJob {
  id          String   @id @default(cuid())
  tenantId    String
  type        String   // "coa", "opening_balances", "vendors", etc.
  status      String   // "pending", "completed", "failed"
  summary     Json     // { rowsProcessed, rowsSucceeded, rowsFailed }
  undoToken   Json?    // { entityType, entityIds[] } for rollback
  createdAt   DateTime @default(now())
  completedAt DateTime?
  createdBy   String

  @@index([tenantId, type, createdAt])
}
```

**Current Workaround**:
- Import operations log to `AuditLog` with action `IMPORT_APPLIED`
- Undo operations would need to query AuditLog and reverse entries manually (not automated)

---

## Constraints

- **Schema locked**: No changes to `apps/web/prisma/schema.prisma` or Prisma migrations
- **No JSON/file stores**: All import job state must come from Postgres (when ImportJob model exists)
- **Tenant-scoped**: All operations respect existing tenant patterns
- **RBAC-preserved**: All operations respect existing RBAC patterns
- **Safe by default**: No destructive changes (no deletes, only upserts)
- **Nexa shell unchanged**: Logo behavior unchanged

---

## How to Use

### COA Export
```bash
GET /api/import/coa/export
# Returns CSV download
```

### COA Import
```bash
POST /api/import/coa/preview
Body: { csv: "Code,Name,Type\n1000,Cash,asset" }
# Returns: { supported: true, rows: [...], errors: [] }

POST /api/import/coa/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 10, errors: [] }
```

### Opening Balances Import
```bash
POST /api/import/opening-balances/preview
Body: { csv: "AccountCode,Debit,Credit\n1000,1000,0" }
# Returns: { supported: true, rows: [...], errors: [], totals: { debit, credit } }

POST /api/import/opening-balances/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 5, errors: [] }
```

### Vendor Import
```bash
POST /api/import/vendors/preview
Body: { csv: "Code,Name,Email\nSUPP-001,Acme Corp,acme@example.com" }
# Returns: { supported: true, rows: [...], errors: [] }

POST /api/import/vendors/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 20, errors: [] }
```

### Item Master Import
```bash
POST /api/import/items/preview
Body: { csv: "SKU,QtyOnHand,WarehouseCode\nITEM-001,100,WH-01" }
# Returns: { supported: true, rows: [...], errors: [] }

POST /api/import/items/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 50, errors: [] }
```

### Purchase Order Import
```bash
POST /api/import/purchase-orders/preview
Body: { csv: "Number,SupplierCode,OrderDate,SKU,Qty,Price\nPO-001,SUPP-001,2025-01-01,ITEM-001,10,100" }
# Returns: { supported: true, rows: [...], errors: [] }

POST /api/import/purchase-orders/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 5, errors: [] }
```

### Payroll Import
```bash
POST /api/import/payroll/preview
Body: { csv: "RunId,EmployeeNo,GrossPay,NetPay\nRUN-001,EMP-001,5000,4000" }
# Returns: { supported: true, rows: [...], errors: [] }

POST /api/import/payroll/apply
Body: { csv: "..." }
# Returns: { supported: true, applied: 10, errors: [] }
```

---

## Schema Gaps Summary

### Critical Gaps (Block Full Implementation)

1. **No Customer Model**
   - Impact: Customer imports return `supported:false` / 501
   - Workaround: Cannot import customers; must create via CustomerInvoice `customerId` field manually

2. **No SalesOrder Model**
   - Impact: Sales order imports return `supported:false` / 501
   - Workaround: Cannot import sales orders; only CustomerInvoice exists

3. **No PriceList Model**
   - Impact: Price list imports return `supported:false` / 501
   - Workaround: Cannot import price lists

4. **No ImportJob Model**
   - Impact: Cannot track import jobs or provide undo functionality
   - Workaround: Import operations log to AuditLog but cannot be undone automatically

### Partial Gaps (Limited Functionality)

1. **Account Model Limitations**
   - No `parentCode`, `currency`, `active` fields
   - Impact: COA import ignores these fields
   - Workaround: Import works but parent/currency/active info is lost

2. **InventoryItem Limitations**
   - No `name` or `description` fields
   - Impact: Item import only handles SKU and quantity
   - Workaround: Import works but name/description cannot be set

---

## Future Schema Migration Requirements

To enable full import/export functionality, add:

```prisma
model Customer {
  id        String   @id @default(cuid())
  tenantId  String
  code      String   @unique
  name      String
  email     String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}

model SalesOrder {
  id         String    @id @default(cuid())
  tenantId   String
  number     String    @unique
  customerId String
  currency   String    @default("GBP")
  status     String    @default("draft")
  orderDate  DateTime  @default(now())
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  lines      SoLine[]

  @@index([tenantId, customerId])
}

model SoLine {
  id        String      @id @default(cuid())
  soId      String
  lineNo    Int
  sku       String
  qty       Decimal
  price     Decimal
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  tenantId  String
  so        SalesOrder  @relation(fields: [soId], references: [id])

  @@unique([soId, lineNo])
  @@index([tenantId])
}

model PriceList {
  id        String   @id @default(cuid())
  tenantId  String
  code      String   @unique
  name      String
  currency  String   @default("GBP")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lines     PriceListItem[]

  @@index([tenantId])
}

model PriceListItem {
  id         String    @id @default(cuid())
  priceListId String
  sku        String
  price      Decimal
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  tenantId   String
  priceList  PriceList @relation(fields: [priceListId], references: [id])

  @@unique([priceListId, sku])
  @@index([tenantId])
}

model ImportJob {
  id          String   @id @default(cuid())
  tenantId    String
  type        String   // "coa", "opening_balances", "vendors", etc.
  status      String   // "pending", "completed", "failed"
  summary     Json     // { rowsProcessed, rowsSucceeded, rowsFailed }
  undoToken   Json?    // { entityType, entityIds[] } for rollback
  createdAt   DateTime @default(now())
  completedAt DateTime?
  createdBy   String

  @@index([tenantId, type, createdAt])
}
```

---

## Telemetry and Logging

### Audit Log Events

All import operations log to `AuditLog` table:

- **IMPORT_PREVIEWED**: `{ tenantId, type, rowCount, errorCount }`
- **IMPORT_APPLIED**: `{ tenantId, type, rowsProcessed, rowsSucceeded, rowsFailed, jobId? }`
- **IMPORT_UNDO_PREVIEWED**: `{ tenantId, jobId }`
- **IMPORT_UNDO_APPLIED**: `{ tenantId, jobId, entitiesReversed }`

### Telemetry

Import operations also log to telemetry (Sentry/metrics) with non-PII payload:
- `import.preview` — On preview
- `import.apply` — On apply
- `import.undo` — On undo (if supported)

