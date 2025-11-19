# Nexa ERP Depth Pass — Schema Design

**Date**: 2025-01-18  
**Status**: Design Phase (Not Yet Applied)

---

## Purpose

This document defines the schema extensions required for the Depth Pass, covering CRM/Sales, Projects/PSA, POS, Tax, WMS/Inventory/Manufacturing, and Metrics modules.

**IMPORTANT**: This is a design document only. Schema changes will be applied via Prisma migrations in Phase 3, after Neon snapshot creation in Phase 2.

---

## Design Principles

1. **Multi-Tenancy**: All tables have `tenantId` non-nullable, consistent with existing patterns
2. **Audit**: All tables include `createdAt`, `updatedAt`; sensitive tables include `createdBy`, `updatedBy`
3. **Soft Delete**: Where applicable, `deletedAt` for soft deletes
4. **Event References**: Transaction tables include `sourceEventId` to link back to events
5. **Indexes**: All foreign keys and frequently queried fields are indexed
6. **Cascade**: Explicit cascade behaviour for related records

---

## 1. CRM / Sales Extensions

### 1.1 CRM Account (CRM Entity)

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, tenantId, name, type, website, industry, createdAt, updatedAt
- Missing: code (unique per tenant), phone, email, address fields, status, ownerId, createdBy, updatedBy, deletedAt

**Enhancement Required**:
- Add `code` field with unique constraint per tenant
- Add `status`, `ownerId`, `createdBy`, `updatedBy`, `deletedAt` fields
- Add address fields (address, city, postcode, country)
- Add phone, email fields
- Add indexes for status, ownerId, type

### 1.2 CRM Contact

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, tenantId, accountId, firstName, lastName, email, phone, title, createdAt, updatedAt
- Missing: status, ownerId, createdBy, updatedBy, deletedAt

**Enhancement Required**:
- Add `status`, `ownerId`, `createdBy`, `updatedBy`, `deletedAt` fields
- Add indexes for status, ownerId

### 1.3 CRM Activity

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, tenantId, contactId, accountId, type, subject, description, dueDate, completedAt, createdAt, updatedAt
- Missing: opportunityId, assignedTo, status, createdBy, updatedBy

**Enhancement Required**:
- Add `opportunityId` field and relation to Opportunity
- Add `assignedTo`, `status`, `createdBy`, `updatedBy` fields
- Add indexes for type/status, assignedTo, opportunityId

### 1.4 Opportunity

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, tenantId, accountId, name, stage, value, probability, closeDate, createdAt, updatedAt
- Missing: contactId, currency, expectedCloseDate, actualCloseDate, ownerId, status, source, description, createdBy, updatedBy, deletedAt
- Missing: relation to SalesQuote

**Enhancement Required**:
- Add `contactId` field and relation to CrmContact
- Add `currency`, `expectedCloseDate`, `actualCloseDate`, `ownerId`, `status`, `source`, `description` fields
- Add `createdBy`, `updatedBy`, `deletedAt` fields
- Add relation to SalesQuote (opportunityId on SalesQuote)
- Rename `value` to `amount` for consistency (or keep both)
- Add indexes for ownerId, expectedCloseDate

### 1.5 Opportunity Stage History

```prisma
model OpportunityStageHistory {
  id            String      @id @default(cuid())
  opportunityId String
  fromStage     String?
  toStage        String
  probability   Int
  changedAt      DateTime   @default(now())
  changedBy      String?
  
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  
  @@index([opportunityId, changedAt])
}
```

### 1.6 Sales Quote

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, tenantId, customerId, number, version, status, validUntil, total, currency, createdAt, updatedAt
- Missing: opportunityId, sentAt, acceptedAt, rejectedAt, createdBy, updatedBy

**Enhancement Required**:
- Add `opportunityId` field and relation to Opportunity
- Add `sentAt`, `acceptedAt`, `rejectedAt`, `createdBy`, `updatedBy` fields
- Add index for opportunityId, status

### 1.7 Sales Quote Line

**Status**: ✅ EXISTS (but needs enhancement)

**Current Model**:
- Has: id, quoteId, lineNo, sku, description, qty, price, total, createdAt, updatedAt
- Missing: discount field

**Enhancement Required**:
- Add `discount` field (Decimal, default 0)

**Note**: SalesOrder and SalesOrderLine already exist and link to Quote via quoteId.

---

## 2. Projects / PSA Extensions

### 2.1 WIP Ledger

```prisma
model WipLedger {
  id          String        @id @default(cuid())
  tenantId    String
  projectId   String
  phaseId     String?
  type        String        // timesheet, expense, material, overhead
  referenceId String?       // Timesheet ID, Expense ID, etc.
  description String
  amount      Decimal
  currency    String        @default("GBP")
  postedAt    DateTime      @default(now())
  billed      Boolean       @default(false)
  invoiceId   String?       // Invoice ID when billed
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  phase       ProjectPhase? @relation(fields: [phaseId], references: [id], onDelete: SetNull)
  
  @@index([tenantId, projectId, phaseId])
  @@index([tenantId, projectId, billed])
  @@index([tenantId, invoiceId])
}
```

### 2.2 Billing Schedule

```prisma
model BillingSchedule {
  id          String        @id @default(cuid())
  tenantId    String
  projectId   String
  phaseId     String?
  type        String        // time_materials, fixed_fee, milestone
  frequency   String?       // For T&M: weekly, monthly
  amount      Decimal?
  rate        Decimal?      // For T&M: hourly rate
  nextBillDate DateTime?
  lastBillDate DateTime?
  status      String        @default("active") // active, completed, cancelled
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  phase       ProjectPhase? @relation(fields: [phaseId], references: [id], onDelete: SetNull)
  
  @@index([tenantId, projectId])
  @@index([tenantId, nextBillDate])
  @@index([tenantId, status])
}
```

**Note**: Project, ProjectPhase, ProjectTask, Timesheet, ProjectRetainer, ProjectInvoiceLine already exist.

---

## 3. POS Extensions

### 3.1 POS Receipt

```prisma
model PosReceipt {
  id            String           @id @default(cuid())
  tenantId      String
  sessionId     String
  number        String           @unique
  customerId    String?
  total         Decimal          @default(0)
  discount      Decimal          @default(0)
  tax           Decimal          @default(0)
  totalPaid     Decimal          @default(0)
  currency      String           @default("GBP")
  status        String           @default("completed") // completed, refunded, voided
  paymentMethod String           // cash, card, voucher, mixed
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  
  session       PosSession       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  customer      Customer?        @relation(fields: [customerId], references: [id], onDelete: SetNull)
  lines         PosReceiptLine[]
  payments      PosPayment[]
  refunds       PosRefund[]
  
  @@index([tenantId, sessionId])
  @@index([tenantId, customerId])
  @@index([tenantId, createdAt])
}
```

### 3.2 POS Receipt Line

```prisma
model PosReceiptLine {
  id          String      @id @default(cuid())
  receiptId   String
  lineNo      Int
  sku         String
  description String
  qty         Decimal
  price       Decimal
  discount    Decimal     @default(0)
  tax         Decimal     @default(0)
  total       Decimal
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  receipt     PosReceipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  @@unique([receiptId, lineNo])
  @@index([receiptId])
}
```

### 3.3 POS Payment

```prisma
model PosPayment {
  id          String      @id @default(cuid())
  receiptId   String
  method      String      // cash, card, voucher, etc.
  amount      Decimal
  reference   String?     // Card reference, voucher code, etc.
  createdAt   DateTime    @default(now())
  
  receipt     PosReceipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  @@index([receiptId])
}
```

### 3.4 POS Refund

```prisma
model PosRefund {
  id          String      @id @default(cuid())
  tenantId    String
  receiptId   String
  number      String      @unique
  amount      Decimal
  reason      String?
  createdAt   DateTime    @default(now())
  createdBy   String?
  
  receipt     PosReceipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, receiptId])
}
```

### 3.5 Promotion

```prisma
model Promotion {
  id          String              @id @default(cuid())
  tenantId    String
  code        String              @unique
  name        String
  type        String              // percentage, fixed, buy_x_get_y, multi_buy
  active      Boolean             @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  
  conditions  PromotionCondition[]
  rewards     PromotionReward[]
  
  @@index([tenantId, active])
  @@index([tenantId, startDate, endDate])
}
```

### 3.6 Promotion Condition

```prisma
model PromotionCondition {
  id          String      @id @default(cuid())
  promotionId String
  type        String      // min_qty, min_amount, sku, category
  value       String      // JSON: { minQty: 2, sku: "ABC123", etc. }
  createdAt   DateTime    @default(now())
  
  promotion   Promotion   @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  
  @@index([promotionId])
}
```

### 3.7 Promotion Reward

```prisma
model PromotionReward {
  id          String      @id @default(cuid())
  promotionId String
  type        String      // discount_percent, discount_fixed, free_item, etc.
  value       String      // JSON: { percent: 10, amount: 5.00, freeSku: "XYZ" }
  createdAt   DateTime    @default(now())
  
  promotion   Promotion   @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  
  @@index([promotionId])
}
```

### 3.8 Cash Movement

```prisma
model CashMovement {
  id          String      @id @default(cuid())
  tenantId    String
  sessionId   String
  type        String      // opening_float, sale, refund, cash_out, cash_in
  amount      Decimal
  description String?
  createdAt   DateTime    @default(now())
  createdBy   String?
  
  session     PosSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, sessionId])
  @@index([tenantId, createdAt])
}
```

### 3.9 Z Report

```prisma
model ZReport {
  id              String      @id @default(cuid())
  tenantId        String
  sessionId       String
  reportNumber    String      @unique
  totalSales      Decimal     @default(0)
  totalDiscounts  Decimal     @default(0)
  totalTax        Decimal     @default(0)
  totalCash       Decimal     @default(0)
  totalCard       Decimal     @default(0)
  totalOther      Decimal     @default(0)
  openingFloat    Decimal     @default(0)
  closingFloat    Decimal     @default(0)
  variance        Decimal     @default(0)
  receiptCount    Int         @default(0)
  generatedAt     DateTime    @default(now())
  generatedBy     String?
  
  session         PosSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, sessionId])
  @@index([tenantId, generatedAt])
}
```

**Note**: PosSession already exists. Ensure it links to Store and TillShift properly.

---

## 4. Tax Extensions

### 4.1 Tax Group

```prisma
model TaxGroup {
  id          String      @id @default(cuid())
  tenantId    String
  code        String      @unique
  name        String
  description String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  rules       TaxRule[]
  
  @@index([tenantId, code])
}
```

### 4.2 Tax Rule

```prisma
model TaxRule {
  id            String      @id @default(cuid())
  taxGroupId    String
  jurisdiction  String      // UK, EU, GCC, etc.
  productCode   String?     // Specific product SKU
  customerCode  String?     // Specific customer
  category      String?     // Product category
  rate          Decimal
  effectiveFrom DateTime
  effectiveTo   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  taxGroup      TaxGroup    @relation(fields: [taxGroupId], references: [id], onDelete: Cascade)
  
  @@index([taxGroupId, jurisdiction])
  @@index([taxGroupId, productCode])
  @@index([taxGroupId, customerCode])
  @@index([taxGroupId, effectiveFrom, effectiveTo])
}
```

### 4.3 Tax Jurisdiction

```prisma
model TaxJurisdiction {
  id          String      @id @default(cuid())
  tenantId    String
  code        String      @unique // UK, EU-GB, EU-FR, GCC-AE, etc.
  name        String
  country     String
  region      String?
  taxType     String      // VAT, GST, SalesTax
  rules       Json?       // JSON: { reverseCharge: true, zeroRating: [...], exemptions: [...] }
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([tenantId, code])
  @@index([tenantId, country])
}
```

**Note**: TaxCode and TaxRate already exist. VatReturn exists but needs `tenantId` added (migration).

---

## 5. WMS / Inventory Extensions

### 5.1 Stock Move Ledger

```prisma
model StockMove {
  id            String      @id @default(cuid())
  tenantId      String
  sku           String
  warehouseId   String?
  fromLocationId String?
  toLocationId  String?
  type          String      // receipt, issue, transfer, adjustment, cycle_count, production_issue, production_receipt
  qty           Decimal
  unitCost      Decimal     @default(0)
  totalCost     Decimal     @default(0)
  sourceType    String?     // po, so, wo, cycle_count, adjustment, etc.
  sourceId      String?     // PO ID, SO ID, WO ID, etc.
  lotId         String?     // InventoryLot ID
  reference     String?     // External reference
  notes         String?
  movedAt       DateTime    @default(now())
  movedBy       String?
  sourceEventId String?     // Event ID that triggered this move
  
  warehouse     Warehouse?  @relation(fields: [warehouseId], references: [id], onDelete: SetNull)
  fromLocation  Location?   @relation("StockMoveFrom", fields: [fromLocationId], references: [id], onDelete: SetNull)
  toLocation    Location?   @relation("StockMoveTo", fields: [toLocationId], references: [id], onDelete: SetNull)
  lot           InventoryLot? @relation(fields: [lotId], references: [id], onDelete: SetNull)
  
  @@index([tenantId, sku])
  @@index([tenantId, warehouseId])
  @@index([tenantId, type])
  @@index([tenantId, sourceType, sourceId])
  @@index([tenantId, movedAt])
  @@index([tenantId, lotId])
}
```

**Note**: Add relation to Warehouse and Location models.

### 5.2 Cycle Count Plan

```prisma
model CycleCountPlan {
  id          String            @id @default(cuid())
  tenantId    String
  warehouseId String
  name        String
  frequency   String            // daily, weekly, monthly, ad_hoc
  status      String            @default("planned") // planned, in_progress, completed, cancelled
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  createdBy   String?
  
  warehouse   Warehouse         @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  lines       CycleCountLine[]
  
  @@index([tenantId, warehouseId])
  @@index([tenantId, status])
  @@index([tenantId, startDate])
}
```

### 5.3 Cycle Count Line

```prisma
model CycleCountLine {
  id              String          @id @default(cuid())
  planId          String
  sku             String
  locationId      String?
  expectedQty     Decimal
  countedQty      Decimal?
  varianceQty     Decimal         @default(0)
  status          String          @default("pending") // pending, counted, approved, rejected
  countedAt       DateTime?
  countedBy       String?
  approvedAt      DateTime?
  approvedBy      String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  plan            CycleCountPlan  @relation(fields: [planId], references: [id], onDelete: Cascade)
  location        Location?       @relation(fields: [locationId], references: [id], onDelete: SetNull)
  
  @@index([planId])
  @@index([planId, status])
}
```

**Note**: Add relation to Location model.

### 5.4 Shipment (Outbound)

```prisma
model Shipment {
  id            String          @id @default(cuid())
  tenantId      String
  number        String          @unique
  orderId       String?         // SalesOrder ID
  orderType     String?         // sales_order, work_order, transfer
  warehouseId   String
  carrier       String?
  tracking      String?
  status        String          @default("pending") // pending, picked, packed, shipped, delivered, cancelled
  shippedAt     DateTime?
  deliveredAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  createdBy     String?
  
  warehouse     Warehouse       @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  lines         ShipmentLine[]
  
  @@index([tenantId, orderId, orderType])
  @@index([tenantId, warehouseId])
  @@index([tenantId, status])
}
```

### 5.5 Shipment Line

```prisma
model ShipmentLine {
  id          String      @id @default(cuid())
  shipmentId  String
  lineNo      Int
  sku         String
  qty         Decimal
  pickedQty   Decimal     @default(0)
  packedQty   Decimal     @default(0)
  shippedQty Decimal     @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  shipment    Shipment    @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  
  @@unique([shipmentId, lineNo])
  @@index([shipmentId])
}
```

### 5.6 Putaway Task

```prisma
model PutawayTask {
  id          String      @id @default(cuid())
  tenantId    String
  grnId       String?     // ASN/GRN reference
  sku         String
  qty         Decimal
  fromLocationId String?  // Staging area
  toLocationId  String    // Target bin
  status      String      @default("pending") // pending, in_progress, completed, cancelled
  assignedTo  String?     // User ID
  completedAt DateTime?
  completedBy String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  fromLocation Location?  @relation("PutawayFrom", fields: [fromLocationId], references: [id], onDelete: SetNull)
  toLocation   Location   @relation("PutawayTo", fields: [toLocationId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, status])
  @@index([tenantId, assignedTo])
  @@index([tenantId, grnId])
}
```

**Note**: Add relations to Location model (from/to).

---

## 6. Manufacturing Extensions

### 6.1 Work Center

```prisma
model WorkCenter {
  id          String            @id @default(cuid())
  tenantId    String
  code        String            @unique
  name        String
  type        String            // machine, labour, overhead
  capacity    Decimal?          // Hours per day
  costRate    Decimal?          // Cost per hour
  status      String            @default("active") // active, inactive
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  operations  RoutingStep[]     // Link to existing RoutingStep.resourceCode
  
  @@index([tenantId, code])
  @@index([tenantId, status])
}
```

**Note**: Link to RoutingStep via resourceCode (string match, not FK).

### 6.2 Work Order Material Issue

```prisma
model WorkOrderMaterialIssue {
  id          String      @id @default(cuid())
  tenantId    String
  workOrderId String
  sku         String
  qty         Decimal
  unitCost    Decimal     @default(0)
  totalCost   Decimal     @default(0)
  lotId       String?     // InventoryLot ID
  type        String      @default("issue") // issue, return
  issuedAt    DateTime    @default(now())
  issuedBy    String?
  notes       String?
  
  workOrder   WorkOrder   @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  lot         InventoryLot? @relation(fields: [lotId], references: [id], onDelete: SetNull)
  
  @@index([tenantId, workOrderId])
  @@index([tenantId, sku])
  @@index([tenantId, issuedAt])
}
```

**Note**: Add relation to InventoryLot model.

### 6.3 Scrap Record

```prisma
model ScrapRecord {
  id          String      @id @default(cuid())
  tenantId    String
  workOrderId String
  sku         String
  qty         Decimal
  reason      String
  cost        Decimal     @default(0)
  recordedAt  DateTime    @default(now())
  recordedBy  String?
  
  workOrder   WorkOrder   @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, workOrderId])
  @@index([tenantId, sku])
}
```

### 6.4 Variance Report

```prisma
model VarianceReport {
  id              String      @id @default(cuid())
  tenantId        String
  workOrderId     String
  type            String      // material, labour, overhead
  standardCost    Decimal
  actualCost      Decimal
  variance        Decimal
  variancePercent Decimal
  reason          String?
  posted          Boolean     @default(false)
  postedAt        DateTime?
  createdAt       DateTime    @default(now())
  createdBy       String?
  
  workOrder       WorkOrder   @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  
  @@index([tenantId, workOrderId])
  @@index([tenantId, posted])
  @@index([tenantId, createdAt])
}
```

**Note**: WorkOrder, BomItem, RoutingStep, MrpPlan, CapacityCalendar already exist.

---

## 7. Metrics Store (Star Schema)

### 7.1 Dimension Tables

#### DimDate

```prisma
model DimDate {
  id          String      @id @default(cuid())
  date        DateTime    @unique
  year        Int
  quarter     Int
  month       Int
  week        Int
  day         Int
  dayOfWeek   Int         // 1-7
  isWeekend   Boolean
  isHoliday   Boolean     @default(false)
  fiscalYear  Int?
  fiscalQuarter Int?
  
  @@index([year, month])
  @@index([year, quarter])
}
```

#### DimTenant

```prisma
model DimTenant {
  id          String      @id @default(cuid())
  tenantId    String      @unique
  name        String
  region      String?
  industry    String?
  createdAt   DateTime
  
  @@index([region])
  @@index([industry])
}
```

#### DimCustomer

```prisma
model DimCustomer {
  id          String      @id @default(cuid())
  tenantId    String
  customerId  String
  code        String
  name        String
  type        String?
  industry    String?
  region      String?
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([tenantId, customerId])
  @@index([tenantId, type])
  @@index([tenantId, industry])
}
```

#### DimProduct

```prisma
model DimProduct {
  id          String      @id @default(cuid())
  tenantId    String
  sku         String
  name        String
  category    String?
  brand       String?
  unitOfMeasure String?
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([tenantId, sku])
  @@index([tenantId, category])
}
```

#### DimLocation

```prisma
model DimLocation {
  id          String      @id @default(cuid())
  tenantId    String
  warehouseId String
  locationId  String?
  warehouseCode String
  locationCode  String?
  warehouseName String
  locationName  String?
  type        String?
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([tenantId, warehouseId, locationId])
  @@index([tenantId, warehouseCode])
}
```

#### DimProject

```prisma
model DimProject {
  id          String      @id @default(cuid())
  tenantId    String
  projectId   String
  code        String
  name        String
  customerId  String?
  status      String?
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([tenantId, projectId])
  @@index([tenantId, customerId])
  @@index([tenantId, status])
}
```

#### DimChannel

```prisma
model DimChannel {
  id          String      @id @default(cuid())
  tenantId    String
  channelId   String
  code        String
  name        String
  type        String      // pos, online, marketplace, etc.
  createdAt   DateTime
  updatedAt   DateTime
  
  @@unique([tenantId, channelId])
  @@index([tenantId, type])
}
```

### 7.2 Fact Tables

#### FactInvoice

```prisma
model FactInvoice {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String      // DimDate ID
  tenantDimId     String      // DimTenant ID
  customerDimId   String      // DimCustomer ID
  invoiceId       String      // Source invoice ID
  invoiceNumber   String
  total           Decimal
  tax             Decimal
  discount        Decimal
  net             Decimal
  currency        String
  status          String
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  customerDim     DimCustomer @relation(fields: [customerDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, customerDimId])
  @@index([tenantId, invoiceId])
  @@index([tenantId, createdAt])
}
```

#### FactOrder

```prisma
model FactOrder {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String
  tenantDimId     String
  customerDimId   String
  orderId         String
  orderNumber     String
  total           Decimal
  currency        String
  status          String
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  customerDim     DimCustomer @relation(fields: [customerDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, customerDimId])
  @@index([tenantId, orderId])
}
```

#### FactReceipt (POS)

```prisma
model FactReceipt {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String
  tenantDimId     String
  customerDimId   String?
  channelDimId    String      // DimChannel ID
  receiptId       String
  receiptNumber   String
  total           Decimal
  discount        Decimal
  tax             Decimal
  net             Decimal
  currency        String
  paymentMethod   String
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  customerDim     DimCustomer? @relation(fields: [customerDimId], references: [id])
  channelDim      DimChannel  @relation(fields: [channelDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, channelDimId])
  @@index([tenantId, receiptId])
}
```

#### FactProjectWip

```prisma
model FactProjectWip {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String
  tenantDimId     String
  projectDimId    String      // DimProject ID
  customerDimId   String?
  wipLedgerId     String      // WipLedger ID
  amount          Decimal
  currency        String
  type            String      // timesheet, expense, material, overhead
  billed          Boolean
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  projectDim      DimProject  @relation(fields: [projectDimId], references: [id])
  customerDim     DimCustomer? @relation(fields: [customerDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, projectDimId])
  @@index([tenantId, billed])
}
```

#### FactInventoryMovement

```prisma
model FactInventoryMovement {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String
  tenantDimId     String
  productDimId    String      // DimProduct ID
  locationDimId   String      // DimLocation ID
  stockMoveId     String      // StockMove ID
  qty             Decimal
  unitCost        Decimal
  totalCost       Decimal
  type            String      // receipt, issue, transfer, adjustment
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  productDim      DimProduct  @relation(fields: [productDimId], references: [id])
  locationDim     DimLocation @relation(fields: [locationDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, productDimId])
  @@index([tenantId, locationDimId])
  @@index([tenantId, type])
}
```

#### FactWorkOrder

```prisma
model FactWorkOrder {
  id              String      @id @default(cuid())
  tenantId        String
  dateId          String
  tenantDimId     String
  productDimId    String
  workOrderId     String
  workOrderNumber String
  qty             Decimal
  status          String
  materialCost    Decimal     @default(0)
  labourCost      Decimal     @default(0)
  overheadCost    Decimal     @default(0)
  totalCost       Decimal
  createdAt       DateTime
  
  date            DimDate     @relation(fields: [dateId], references: [id])
  tenantDim       DimTenant   @relation(fields: [tenantDimId], references: [id])
  productDim      DimProduct  @relation(fields: [productDimId], references: [id])
  
  @@index([tenantId, dateId])
  @@index([tenantId, productDimId])
  @@index([tenantId, workOrderId])
  @@index([tenantId, status])
}
```

---

## 8. Schema Updates to Existing Models

### 8.1 VatReturn - Add tenantId

```prisma
model VatReturn {
  // ... existing fields ...
  tenantId    String      // ADD THIS FIELD
  // ... rest of model ...
  
  @@index([tenantId, periodKey])
}
```

### 8.2 Location - Add Relations for StockMove

```prisma
model Location {
  // ... existing fields ...
  stockMovesFrom StockMove[] @relation("StockMoveFrom")
  stockMovesTo   StockMove[] @relation("StockMoveTo")
  putawayTasksFrom PutawayTask[] @relation("PutawayFrom")
  putawayTasksTo   PutawayTask[] @relation("PutawayTo")
  cycleCountLines CycleCountLine[]
  // ... rest of model ...
}
```

### 8.3 Warehouse - Add Relations

```prisma
model Warehouse {
  // ... existing fields ...
  stockMoves     StockMove[]
  cycleCountPlans CycleCountPlan[]
  shipments      Shipment[]
  // ... rest of model ...
}
```

### 8.4 InventoryLot - Add Relations

```prisma
model InventoryLot {
  // ... existing fields ...
  stockMoves           StockMove[]
  workOrderMaterialIssues WorkOrderMaterialIssue[]
  // ... rest of model ...
}
```

### 8.5 Customer - Add Relations

```prisma
model Customer {
  // ... existing fields ...
  posReceipts    PosReceipt[]
  // ... rest of model ...
}
```

### 8.6 SalesOrder - Ensure Quote Link

```prisma
model SalesOrder {
  // ... existing fields ...
  quoteId       String?     // Should already exist
  quote         SalesQuote? @relation(fields: [quoteId], references: [id])
  // ... rest of model ...
}
```

---

## 9. Migration Strategy

### Migration Order

1. **Migration 1**: Add CRM models (CrmAccount, CrmContact, CrmActivity, Opportunity, OpportunityStageHistory)
2. **Migration 2**: Add Sales Quote models (SalesQuote, SalesQuoteLine)
3. **Migration 3**: Add POS models (PosReceipt, PosReceiptLine, PosPayment, PosRefund, Promotion, PromotionCondition, PromotionReward, CashMovement, ZReport)
4. **Migration 4**: Add Tax models (TaxGroup, TaxRule, TaxJurisdiction) + Add tenantId to VatReturn
5. **Migration 5**: Add Projects WIP/Billing (WipLedger, BillingSchedule)
6. **Migration 6**: Add WMS models (StockMove, CycleCountPlan, CycleCountLine, Shipment, ShipmentLine, PutawayTask) + Update Location/Warehouse relations
7. **Migration 7**: Add Manufacturing models (WorkCenter, WorkOrderMaterialIssue, ScrapRecord, VarianceReport) + Update InventoryLot relations
8. **Migration 8**: Add Metrics dimensions (DimDate, DimTenant, DimCustomer, DimProduct, DimLocation, DimProject, DimChannel)
9. **Migration 9**: Add Metrics facts (FactInvoice, FactOrder, FactReceipt, FactProjectWip, FactInventoryMovement, FactWorkOrder)

### Index Strategy

- All `tenantId` fields indexed
- All foreign keys indexed
- Frequently queried fields indexed (status, dates, codes)
- Composite indexes for common query patterns

### Data Migration Notes

- **DimDate**: Pre-populate with dates for next 5 years
- **DimTenant**: Populate from existing Tenant table
- **DimCustomer**: Populate from existing Customer table
- **DimProduct**: Populate from distinct SKUs in InventoryItem
- **DimLocation**: Populate from Warehouse + Location tables
- **DimProject**: Populate from existing Project table
- **DimChannel**: Seed with default channels (pos, online, etc.)

---

## 10. Validation Checklist

Before applying migrations:

- [ ] All tables have `tenantId` non-nullable
- [ ] All foreign keys respect tenant boundaries
- [ ] All tables have `createdAt`, `updatedAt`
- [ ] Sensitive tables have `createdBy`, `updatedBy`
- [ ] All indexes defined
- [ ] Cascade behaviour explicit
- [ ] Event reference fields (`sourceEventId`) included where needed
- [ ] Relations to existing models verified
- [ ] Migration order reviewed for dependencies

---

**Last Updated**: 2025-01-18  
**Next Step**: Phase 2 — Neon Snapshot + Migration Rehearsal Setup

---

## Applied Schema Changes (Phase 3)

**Date Applied**: 2025-01-18  
**Migration Name**: `depth-pass-core-schema`  
**Migration Folder**: `20251118213034_depth_pass_core_schema`

### Summary

All planned schema extensions have been implemented in `prisma/schema.prisma`:

- ✅ **CRM/Sales**: Enhanced existing models + added OpportunityStageHistory
- ✅ **POS**: Enhanced PosSale + added CashMovement, ZReport
- ✅ **Tax**: Added TaxGroup, TaxRule, TaxJurisdiction
- ✅ **Projects**: Added WipLedger, BillingSchedule
- ✅ **WMS**: Added StockMove, CycleCountPlan, CycleCountLine, Shipment, ShipmentLine, PutawayTask + updated relations
- ✅ **Manufacturing**: Added WorkCenter, WorkOrderMaterialIssue, ScrapRecord, VarianceReport
- ✅ **Metrics**: Added all Dimension tables (DimDate, DimTenant, DimCustomer, DimProduct, DimLocation, DimProject, DimChannel) + all Fact tables (FactInvoice, FactOrder, FactReceipt, FactProjectWip, FactInventoryMovement, FactWorkOrder)

### Differences from Original Design

**Minor Adjustments**:
- **CrmOpportunity**: Kept both `value` and `amount` fields for backward compatibility (both map to same concept)
- **CrmOpportunity**: Kept `closeDate` as alias for `expectedCloseDate` for backward compatibility
- **PosSale**: Relation name is `posSales` (not `PosSale`) to match Prisma naming conventions
- **Fact Tables**: All use consistent relation naming (e.g., `date`, `tenantDim`, `customerDim`) with proper back-relations on Dimension tables

**No Breaking Changes**: All enhancements are additive; existing fields and relations preserved.

### Validation Status

- ✅ Schema validation: PASSED (`pnpm prisma validate`)
- ✅ Prisma client generation: SUCCESS (`pnpm prisma generate`)
- ✅ Migration creation: SUCCESS (`20251118213034_depth_pass_core_schema`)
- ✅ Migration deployment: SUCCESS (applied to staging database)
- ✅ Migration status: Database schema is up to date

See `/docs/nexa/depth-pass-phase3-summary.md` for detailed list of all changes.

