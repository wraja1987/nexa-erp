# Nexa ERP Depth Pass — Implementation Plan

**Date**: 2025-01-18  
**Status**: Planning Phase

---

## Purpose

This document outlines the plan for implementing full-depth functionality across CRM/Sales, Projects/PSA, POS, Tax, WMS/Inventory/Manufacturing, and Metrics modules, replacing all 501 stubs with production-ready, event-driven flows.

---

## Discovery Summary

### Current State Analysis

**Existing Models** (from schema scan):
- ✅ Project, ProjectPhase, ProjectTask, Timesheet, ProjectRetainer, ProjectInvoiceLine
- ✅ SalesOrder, SalesOrderLine, Reservation
- ✅ Customer (basic)
- ✅ PosSession, PosVariance
- ✅ TaxCode, TaxRate
- ✅ WorkOrder, BomItem, RoutingStep, MrpPlan, CapacityCalendar
- ✅ Warehouse, Location, InventoryItem, InventoryLot, ASN, Wave, PickTask

**Missing Models** (identified gaps):
- ❌ CRM: Account (CRM entity), Contact, Activity, Opportunity, PipelineStage
- ❌ Sales: SalesQuote, SalesQuoteLine
- ❌ POS: PosReceipt, PosReceiptLine, Promotion, PromotionCondition, PromotionReward, CashMovement, ZReport
- ❌ Tax: TaxGroup, TaxRule, TaxJurisdiction (partial - TaxCode/TaxRate exist)
- ❌ WMS: StockMove ledger, CycleCountPlan, CycleCountLine, Shipment (outbound), PutawayTask
- ❌ Manufacturing: WorkCenter, StockMove, WorkOrderMaterialIssue, ScrapRecord, VarianceReport
- ❌ Metrics: Fact tables (FactInvoice, FactOrder, FactReceipt, etc.), Dimension tables (DimDate, DimCustomer, etc.)

**501 Stubs Found**:
- CRM: Account create/update, Contact create/update, Activity create/complete, Opportunity create/update/move
- Sales: Quote create/update/duplicate, Order reserve/backorder
- Projects: Project create/update, Phase create/update, Billing invoice creation
- POS: Session open/close, Cash-up submit, Variance record, Promotion create/update
- Tax: VAT return creation, MTD submission recording
- WMS: Cycle count record/variance, Fulfilment pick/pack/ship confirmations
- Manufacturing: WorkCenter create/update, Consumption issue/return, Variance calculate/post, Routings create/update

---

## Target Modules — Full Depth Requirements

### 1. CRM / Sales Full Pipeline

**Current Gap**:
- Missing CRM entities (Account, Contact, Activity, Opportunity)
- Missing Quote models
- Partial SalesOrder implementation (missing quote linkage, reservation logic incomplete)

**Desired Full Behaviour**:
- **Lead Capture**: Manual entry + API, track source/status/owner
- **Lead → Opportunity**: Qualification workflow with probability tracking
- **Opportunity Management**: Pipeline stages with history, expected close date, amount tracking
- **Opportunity → Quote**: Convert with product/service lines, handle revisions
- **Quote → Order**: Convert with stock reservation, handle partial conversions
- **Order → Invoice**: Convert to Finance invoices with tax calculation, revenue allocation

**Cross-Module Events Required**:
- `crm.opportunity.created`, `crm.opportunity.stage.changed` → Metrics
- `sales.quote.created`, `sales.quote.approved` → Finance (revenue recognition prep)
- `sales.order.created`, `sales.order.confirmed` → Inventory (reservations), Finance (AR), Metrics
- `sales.order.fulfilled` → Inventory (stock movements), Finance (COGS)
- `sales.invoice.generated` → Finance (AR posting), Tax (VAT calculation), Metrics

**Implementation Tasks**:
1. Add CRM models: Account, Contact, Activity, Opportunity, PipelineStage
2. Add Quote models: SalesQuote, SalesQuoteLine
3. Implement Lead → Opportunity → Quote → Order → Invoice conversion flows
4. Wire stock reservation on order confirmation
5. Wire Finance invoice generation with tax
6. Emit events at each conversion step
7. Update UI with conversion buttons and pipeline board

---

### 2. Projects / PSA

**Current Gap**:
- Models exist but services return 501 for create/update
- Missing WIP ledger and billing schedule models
- Billing preview/invoice creation stubbed

**Desired Full Behaviour**:
- **Project Lifecycle**: Create with budgets/rates, phases/tasks with planned vs actual
- **Assignments**: Staff assignments with rates, role tracking
- **Timesheets**: Entry with approval workflow, link to projects/phases/tasks
- **Expenses**: Expense capture with approval, link to projects
- **WIP Rules**: T&M, fixed fee, milestone billing rules
- **WIP Ledger**: Track unbilled costs and revenue per project/phase
- **Billing**: Generate draft invoices into Finance, link to projects/phases
- **Profitability**: Real-time project margin tracking

**Cross-Module Events Required**:
- `projects.timesheet.posted` → Finance (WIP posting), Metrics
- `projects.expense.approved` → Finance (WIP posting), Metrics
- `projects.wip.posted` → Finance (WIP ledger), Metrics
- `projects.invoice.generated` → Finance (AR posting, revenue recognition), Tax, Metrics

**Implementation Tasks**:
1. Add WIP models: WipLedger, BillingSchedule
2. Implement project CRUD (currently 501)
3. Implement phase/task CRUD (currently 501)
4. Implement timesheet approval workflow
5. Implement expense capture and approval
6. Implement WIP calculation and posting
7. Implement billing schedule and invoice generation
8. Wire Finance postings via events
9. Update UI with project dashboard, timesheet entry, billing preview

---

### 3. POS

**Current Gap**:
- PosSession exists but open/close returns 501
- Missing PosReceipt, Promotion models
- Cash-up submit returns 501
- Variance record returns 501

**Desired Full Behaviour**:
- **Session Management**: Open/close with cash counts, user/terminal tracking
- **Promotions**: Engine with percentage/fixed/multi-buy rules, clear discount representation
- **Receipts**: Scan/add items, apply promotions, multiple payment methods
- **Payments**: Cash, card, voucher tracking per receipt
- **Stock Impact**: Reduce inventory with correct cost on receipt posting
- **Finance Impact**: Post revenue, discount, tax to Finance GL
- **Refunds/Exchanges**: Handle returns with stock reversal and Finance adjustments
- **Z Reports**: End-of-day summaries with variance detection

**Cross-Module Events Required**:
- `pos.session.opened` → Metrics
- `pos.receipt.posted` → Inventory (stock reduction), Finance (revenue/tax posting), Metrics
- `pos.refund.posted` → Inventory (stock reversal), Finance (reversal posting), Metrics
- `pos.session.closed` → Finance (cash reconciliation), Metrics

**Implementation Tasks**:
1. Add PosReceipt, PosReceiptLine models
2. Add Promotion, PromotionCondition, PromotionReward models
3. Add CashMovement model for cash tracking
4. Implement session open/close with cash counts
5. Implement promotion engine with rule evaluation
6. Implement receipt creation with item scanning
7. Implement payment processing (multiple methods)
8. Wire stock reduction on receipt posting
9. Wire Finance postings (revenue, discount, tax, COGS)
10. Implement refund/exchange flows
11. Implement Z report generation
12. Update UI with POS terminal interface, session management, reports

---

### 4. Tax

**Current Gap**:
- TaxCode/TaxRate exist but tax calculation is incomplete
- VatReturn missing tenantId (unsafe)
- Missing TaxGroup, TaxRule, TaxJurisdiction models
- Tax calculation not integrated into transaction flows

**Desired Full Behaviour**:
- **Tax Configuration**: Per tenant, per jurisdiction (UK VAT, EU VAT, GCC, etc.)
- **Tax Rates**: Standard, reduced, zero, exempt, reverse charge
- **Tax Groups**: Group products/customers with tax rules
- **Tax Calculation**: Central service used by Quotes, Orders, Invoices, POS, Projects
- **VAT Returns**: Per-tenant VAT return preparation with MTD submission logging
- **Tax Reporting**: Tax liability tracking, VAT return generation

**Cross-Module Events Required**:
- Tax calculation is synchronous part of transaction flows
- `tax.vat.return.prepared` → Finance, Metrics
- `tax.vat.return.submitted` → Audit, Metrics

**Implementation Tasks**:
1. Add tenantId to VatReturn (migration)
2. Add TaxGroup, TaxRule, TaxJurisdiction models
3. Implement central tax calculation service
4. Integrate tax calculation into Quote/Order/Invoice/POS/Project flows
5. Implement VAT return preparation
6. Implement HMRC MTD submission logging
7. Implement GCC e-invoice tax payload generation
8. Update UI with tax configuration, VAT return preparation

---

### 5. Deep WMS / Inventory / Manufacturing

**Current Gap**:
- Missing StockMove ledger
- Missing CycleCountPlan, CycleCountLine
- Missing Shipment (outbound) model
- Missing PutawayTask model
- Missing WorkCenter model
- Missing WorkOrderMaterialIssue, ScrapRecord, VarianceReport

**Desired Full Behaviour**:

**WMS**:
- **GRN**: Goods receipt against POs with partial/over/under delivery handling
- **Putaway**: Tasks from staging to bins with location assignment
- **Picking**: Tasks for sales/work orders with wave management
- **Shipping**: Confirmation with carrier data, shipment tracking
- **Cycle Counting**: Plans, execution, approvals, variance adjustments
- **Stock Movements**: Complete ledger of all inventory changes with source references

**Manufacturing**:
- **Work Orders**: Create from MRP or manual, reserve/issue materials, track operations
- **BOM**: Multi-level BOM with revisions/effective dates
- **Material Issues**: Support backflushing, track component consumption
- **Scrap Tracking**: Record scrap with reasons, impact costing
- **Variance**: Calculate and post material/labour/overhead variances
- **MRP**: Generate suggestions based on demand vs supply, persist to MrpPlan

**Cross-Module Events Required**:
- `wms.grn.received` → Inventory (stock increase), Finance (AP posting), Metrics
- `wms.putaway.completed` → Inventory (location update), Metrics
- `wms.pick.completed` → Inventory (stock decrease), Metrics
- `wms.shipment.confirmed` → Inventory (stock decrease), Finance (COGS), Metrics
- `wms.cyclecount.variance` → Inventory (stock adjustment), Finance (variance posting), Metrics
- `mfg.workorder.released` → Inventory (material reservation), Metrics
- `mfg.workorder.material.issued` → Inventory (stock decrease), Finance (WIP), Metrics
- `mfg.workorder.completed` → Inventory (finished goods increase), Finance (WIP closure, COGS), Metrics
- `mfg.variance.posted` → Finance (variance posting), Metrics

**Implementation Tasks**:
1. Add StockMove ledger model
2. Add CycleCountPlan, CycleCountLine models
3. Add Shipment, ShipmentLine models
4. Add PutawayTask model
5. Add WorkCenter model
6. Add WorkOrderMaterialIssue, ScrapRecord, VarianceReport models
7. Implement GRN flow with putaway task generation
8. Implement putaway task execution
9. Implement picking wave management
10. Implement shipment confirmation
11. Implement cycle count planning and execution
12. Implement work order material issue/return
13. Implement scrap recording
14. Implement variance calculation and posting
15. Implement MRP suggestion generation and persistence
16. Wire all flows to StockMove ledger
17. Wire Finance postings via events
18. Update UI with WMS dashboard, cycle count interface, work order interface

---

### 6. Metrics Store

**Current Gap**:
- No fact tables or dimension tables
- KPIs computed on-demand only
- No historical metrics persistence

**Desired Full Behaviour**:
- **Fact Tables**: FactInvoice, FactOrder, FactReceipt, FactProjectWip, FactInventoryMovement, FactPosSale, FactWorkOrder
- **Dimension Tables**: DimDate, DimTenant, DimCustomer, DimProduct, DimLocation, DimProject, DimChannel
- **Event-Driven ETL**: Domain events update fact tables automatically
- **KPI Integration**: KPI API reads from fact tables for performance
- **Historical Tracking**: Time-series metrics for trend analysis

**Cross-Module Events Required**:
- All domain events from CRM/Sales/Projects/POS/WMS/Manufacturing/Finance feed fact tables
- Event handlers update facts asynchronously via outbox

**Implementation Tasks**:
1. Design fact table schema (star schema)
2. Design dimension table schema
3. Implement ETL handlers for each event type
4. Implement fact table insert/update logic
5. Implement dimension table maintenance
6. Update KPI API to read from fact tables
7. Implement historical metrics queries
8. Update UI dashboards to use fact tables

---

## Event-Bus Integration Points

### Event Producers (Domain Writes)

**CRM/Sales**:
- Opportunity created/updated/stage changed
- Quote created/approved
- Sales order created/confirmed/fulfilled
- Invoice generated

**Projects**:
- Timesheet posted/approved
- Expense approved
- WIP posted
- Invoice generated

**POS**:
- Session opened/closed
- Receipt posted
- Refund posted

**WMS**:
- GRN received
- Putaway completed
- Pick completed
- Shipment confirmed
- Cycle count variance

**Manufacturing**:
- Work order released/completed
- Material issued/returned
- Scrap recorded
- Variance posted

### Event Consumers (Downstream Updates)

**Finance**:
- AR/AP postings from Sales/Projects/POS
- WIP postings from Projects/Manufacturing
- COGS postings from Sales/POS/WMS/Manufacturing
- Variance postings from WMS/Manufacturing

**Inventory**:
- Stock movements from Sales/POS/WMS/Manufacturing
- Reservation updates from Sales
- Lot tracking from WMS/Manufacturing

**Metrics**:
- Fact table updates from all modules
- Dimension table maintenance

---

## Schema Design Considerations

### Multi-Tenancy
- All new tables must have `tenantId` non-nullable
- Foreign keys must respect tenant boundaries
- Indexes should include `tenantId` for performance

### Audit Patterns
- `createdAt`, `updatedAt` on all tables
- `createdBy`, `updatedBy` where applicable
- `deletedAt` for soft deletes where needed
- Link to AuditLog for sensitive operations

### Event References
- Add `sourceEventId` fields to transaction tables to link back to events
- Support event replay by storing event references

---

## Testing Strategy

### Unit Tests
- Service layer tests for each module
- Event handler tests
- Tax calculation tests
- Promotion engine tests

### Integration Tests
- Cross-module flows (Lead → Invoice, Project → Invoice, POS → Finance)
- Event propagation tests
- Stock movement consistency tests

### E2E Tests
- Full pipeline journeys
- Finance posting verification
- Inventory balance verification
- Metrics fact table verification

---

## Migration Strategy

1. **Phase 1**: Add CRM/Sales models (Account, Contact, Activity, Opportunity, Quote)
2. **Phase 2**: Add POS models (Receipt, Promotion, CashMovement)
3. **Phase 3**: Add Tax models (TaxGroup, TaxRule, TaxJurisdiction) + fix VatReturn
4. **Phase 4**: Add WMS models (StockMove, CycleCount, Shipment, PutawayTask)
5. **Phase 5**: Add Manufacturing models (WorkCenter, MaterialIssue, Scrap, Variance)
6. **Phase 6**: Add Metrics models (Fact tables, Dimension tables)
7. **Phase 7**: Add Projects WIP/Billing models (WipLedger, BillingSchedule)

Each phase:
- Create Neon snapshot before migration
- Generate Prisma migration
- Test locally
- Deploy to staging
- Run tests
- Deploy to production (after staging validation)

---

## Success Criteria

- ✅ No 501 responses in targeted modules (CRM/Sales, Projects, POS, Tax, WMS/Manufacturing, Metrics)
- ✅ All conversion flows work end-to-end (Lead → Invoice, Project → Invoice, POS → Finance)
- ✅ All cross-module effects use event-bus/outbox
- ✅ Stock movements tracked in StockMove ledger
- ✅ Finance postings correct and auditable
- ✅ Metrics facts populated from events
- ✅ All tests pass (unit, integration, E2E)
- ✅ RBAC enforced on all new routes
- ✅ Audit logging for all sensitive operations

---

## Next Steps

1. **Phase 0 Complete**: Discovery and spec alignment ✅
2. **Phase 1**: Schema design pass (detailed design document)
3. **Phase 2**: Neon snapshot + migration rehearsal setup
4. **Phase 3**: Apply schema extensions
5. **Phase 4**: Implement full flows per module
6. **Phase 5**: Metrics store implementation
7. **Phase 6**: Cross-module regression + validation
8. **Phase 7**: Clean-up, docs, evidence
9. **Phase 8**: Real-time propagation + event-bus verification
10. **Phase 9**: Spec line-by-line coverage audit

---

**Last Updated**: 2025-01-18

