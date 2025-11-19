# Nexa ERP Depth Pass — Schema Summary

**Date**: 2025-01-18  
**Status**: Design Complete — Ready for Migration

---

## Executive Summary

This document summarizes what models already exist vs what needs to be added for the Depth Pass.

---

## Models Already Exists ✅

### CRM/Sales
- ✅ CrmAccount (needs enhancements: code, status, ownerId, address fields)
- ✅ CrmContact (needs enhancements: status, ownerId)
- ✅ CrmActivity (needs enhancements: opportunityId, assignedTo, status)
- ✅ CrmOpportunity (needs enhancements: contactId, currency, ownerId, status, source, description)
- ✅ SalesQuote (needs enhancements: opportunityId, sentAt, acceptedAt, rejectedAt)
- ✅ SalesQuoteLine (needs enhancement: discount field)
- ✅ SalesOrder (complete)
- ✅ SalesOrderLine (complete)
- ✅ Reservation (complete)

**Missing**: OpportunityStageHistory

### POS
- ✅ PosSession (complete)
- ✅ PosSale (this is the receipt model - complete)
- ✅ PosLine (this is the receipt line model - complete)
- ✅ PosPayment (complete)
- ✅ PosRefund (complete)
- ✅ PosPromotion (complete)
- ✅ PosVariance (complete)

**Missing**: CashMovement, ZReport

### Tax
- ✅ TaxCode (complete)
- ✅ TaxRate (complete)
- ✅ VatReturn (has tenantId - complete)
- ✅ HmrcMtdSubmission (complete)
- ✅ GccEinvoicePayload (complete)

**Missing**: TaxGroup, TaxRule, TaxJurisdiction

### Projects
- ✅ Project (complete)
- ✅ ProjectPhase (complete)
- ✅ ProjectTask (complete)
- ✅ Timesheet (complete)
- ✅ ProjectRetainer (complete)
- ✅ ProjectInvoiceLine (complete)

**Missing**: WipLedger, BillingSchedule

### WMS/Inventory
- ✅ Warehouse (complete)
- ✅ Location (complete)
- ✅ InventoryItem (complete)
- ✅ InventoryLot (complete)
- ✅ ASN (complete)
- ✅ Wave (complete)
- ✅ PickTask (complete)

**Missing**: StockMove, CycleCountPlan, CycleCountLine, Shipment (outbound), PutawayTask

### Manufacturing
- ✅ WorkOrder (complete)
- ✅ BomItem (complete)
- ✅ RoutingStep (complete)
- ✅ MrpPlan (complete)
- ✅ CapacityCalendar (complete)

**Missing**: WorkCenter, WorkOrderMaterialIssue, ScrapRecord, VarianceReport

### Metrics
- ✅ MetricPoint (exists but is JSON-based, not star schema)
- ✅ MetricsSnapshot (exists but is JSON-based, not star schema)

**Missing**: All Fact tables (FactInvoice, FactOrder, FactReceipt, etc.) and Dimension tables (DimDate, DimTenant, etc.)

---

## Models to Add (New Tables)

### CRM/Sales
1. **OpportunityStageHistory** - Track stage changes over time

### POS
1. **CashMovement** - Track cash movements within sessions
2. **ZReport** - End-of-day reports

### Tax
1. **TaxGroup** - Group tax rules
2. **TaxRule** - Tax rules per group/jurisdiction
3. **TaxJurisdiction** - Jurisdiction definitions

### Projects
1. **WipLedger** - Work-in-progress ledger entries
2. **BillingSchedule** - Billing schedule per project/phase

### WMS/Inventory
1. **StockMove** - Complete stock movement ledger
2. **CycleCountPlan** - Cycle count planning
3. **CycleCountLine** - Cycle count execution lines
4. **Shipment** - Outbound shipment tracking
5. **ShipmentLine** - Shipment line items
6. **PutawayTask** - Putaway task tracking

### Manufacturing
1. **WorkCenter** - Work center master data
2. **WorkOrderMaterialIssue** - Material issue/return tracking
3. **ScrapRecord** - Scrap tracking
4. **VarianceReport** - Variance calculation and posting

### Metrics (Star Schema)
1. **DimDate** - Date dimension
2. **DimTenant** - Tenant dimension
3. **DimCustomer** - Customer dimension
4. **DimProduct** - Product dimension
5. **DimLocation** - Location/warehouse dimension
6. **DimProject** - Project dimension
7. **DimChannel** - Channel dimension
8. **FactInvoice** - Invoice facts
9. **FactOrder** - Order facts
10. **FactReceipt** - POS receipt facts
11. **FactProjectWip** - Project WIP facts
12. **FactInventoryMovement** - Inventory movement facts
13. **FactWorkOrder** - Work order facts

---

## Field Enhancements Required (Existing Models)

### CRM Models
- **CrmAccount**: Add code, status, ownerId, phone, email, address fields, createdBy, updatedBy, deletedAt
- **CrmContact**: Add status, ownerId, createdBy, updatedBy, deletedAt
- **CrmActivity**: Add opportunityId, assignedTo, status, createdBy, updatedBy
- **CrmOpportunity**: Add contactId, currency, ownerId, status, source, description, createdBy, updatedBy, deletedAt
- **SalesQuote**: Add opportunityId, sentAt, acceptedAt, rejectedAt, createdBy, updatedBy
- **SalesQuoteLine**: Add discount field

### POS Models
- **PosSale**: Link to PosSession (sessionId field)
- **PosSale**: Add customerId field

### Location/Warehouse Models
- **Location**: Add relations for StockMove (from/to), PutawayTask (from/to), CycleCountLine
- **Warehouse**: Add relations for StockMove, CycleCountPlan, Shipment
- **InventoryLot**: Add relations for StockMove, WorkOrderMaterialIssue

---

## Migration Plan

### Migration 1: CRM Enhancements + OpportunityStageHistory
- Add fields to CrmAccount, CrmContact, CrmActivity, CrmOpportunity, SalesQuote, SalesQuoteLine
- Create OpportunityStageHistory table

### Migration 2: POS Enhancements
- Add CashMovement, ZReport tables
- Add sessionId, customerId to PosSale

### Migration 3: Tax Extensions
- Add TaxGroup, TaxRule, TaxJurisdiction tables

### Migration 4: Projects WIP/Billing
- Add WipLedger, BillingSchedule tables

### Migration 5: WMS Extensions
- Add StockMove, CycleCountPlan, CycleCountLine, Shipment, ShipmentLine, PutawayTask tables
- Update Location, Warehouse, InventoryLot relations

### Migration 6: Manufacturing Extensions
- Add WorkCenter, WorkOrderMaterialIssue, ScrapRecord, VarianceReport tables
- Update InventoryLot relations

### Migration 7: Metrics Star Schema
- Add all Dimension tables
- Add all Fact tables

---

## Next Steps

1. **Phase 2**: Create Neon snapshot
2. **Phase 3**: Apply migrations in order
3. **Phase 4**: Implement services and APIs
4. **Phase 5**: Wire event-bus integration
5. **Phase 6**: Testing and validation

---

**Last Updated**: 2025-01-18

