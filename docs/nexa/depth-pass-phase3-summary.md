# Depth Pass Phase 3 — Schema Extensions Summary

**Date**: 2025-01-18  
**Status**: Schema Updated — Ready for Migration

---

## Schema Changes Applied

### CRM/Sales Enhancements

**Enhanced Models**:
- **CrmAccount**: Added `code` (unique per tenant), `status`, `ownerId`, `phone`, `email`, `address`, `city`, `postcode`, `country`, `createdBy`, `updatedBy`, `deletedAt`
- **CrmContact**: Added `status`, `ownerId`, `createdBy`, `updatedBy`, `deletedAt`
- **CrmActivity**: Added `opportunityId`, `assignedTo`, `status`, `createdBy`, `updatedBy`
- **CrmOpportunity**: Added `contactId`, `currency`, `ownerId`, `status`, `source`, `description`, `createdBy`, `updatedBy`, `deletedAt`, `expectedCloseDate`, `actualCloseDate`; kept `value` and `closeDate` for compatibility
- **SalesQuote**: Added `opportunityId`, `sentAt`, `acceptedAt`, `rejectedAt`, `createdBy`, `updatedBy`
- **SalesQuoteLine**: Added `discount` field

**New Models**:
- **OpportunityStageHistory**: Tracks stage changes over time with `fromStage`, `toStage`, `probability`, `changedAt`, `changedBy`

### POS Enhancements

**Enhanced Models**:
- **PosSale**: Added `sessionId` (relation to PosSession), `customerId` (relation to Customer)

**New Models**:
- **CashMovement**: Tracks cash movements within sessions (`type`, `amount`, `description`, `createdBy`)
- **ZReport**: End-of-day reports with totals, variance, receipt count

### Tax Extensions

**New Models**:
- **TaxGroup**: Groups tax rules (`code`, `name`, `description`)
- **TaxRule**: Tax rules per group/jurisdiction (`jurisdiction`, `productCode`, `customerCode`, `category`, `rate`, `effectiveFrom`, `effectiveTo`)
- **TaxJurisdiction**: Jurisdiction definitions (`code`, `name`, `country`, `region`, `taxType`, `rules` JSON)

### Projects/PSA Extensions

**New Models**:
- **WipLedger**: Work-in-progress ledger entries (`projectId`, `phaseId`, `type`, `referenceId`, `amount`, `billed`, `invoiceId`)
- **BillingSchedule**: Billing schedule per project/phase (`type`, `frequency`, `amount`, `rate`, `nextBillDate`, `lastBillDate`, `status`)

### WMS/Inventory Extensions

**Enhanced Models**:
- **Warehouse**: Added relations to `StockMove[]`, `CycleCountPlan[]`, `Shipment[]`
- **Location**: Added relations to `StockMove[]` (from/to), `PutawayTask[]` (from/to), `CycleCountLine[]`
- **InventoryLot**: Added relations to `StockMove[]`, `WorkOrderMaterialIssue[]`

**New Models**:
- **StockMove**: Complete stock movement ledger (`sku`, `warehouseId`, `fromLocationId`, `toLocationId`, `type`, `qty`, `unitCost`, `totalCost`, `sourceType`, `sourceId`, `lotId`, `reference`, `notes`, `movedAt`, `movedBy`, `sourceEventId`)
- **CycleCountPlan**: Cycle count planning (`warehouseId`, `name`, `frequency`, `status`, `startDate`, `endDate`, `createdBy`)
- **CycleCountLine**: Cycle count execution lines (`planId`, `sku`, `locationId`, `expectedQty`, `countedQty`, `varianceQty`, `status`, `countedAt`, `countedBy`, `approvedAt`, `approvedBy`)
- **Shipment**: Outbound shipment tracking (`number`, `orderId`, `orderType`, `warehouseId`, `carrier`, `tracking`, `status`, `shippedAt`, `deliveredAt`, `createdBy`)
- **ShipmentLine**: Shipment line items (`shipmentId`, `lineNo`, `sku`, `qty`, `pickedQty`, `packedQty`, `shippedQty`)
- **PutawayTask**: Putaway task tracking (`grnId`, `sku`, `qty`, `fromLocationId`, `toLocationId`, `status`, `assignedTo`, `completedAt`, `completedBy`)

### Manufacturing Extensions

**Enhanced Models**:
- **WorkOrder**: Added relations to `WorkOrderMaterialIssue[]`, `ScrapRecord[]`, `VarianceReport[]`

**New Models**:
- **WorkCenter**: Work center master data (`code`, `name`, `type`, `capacity`, `costRate`, `status`)
- **WorkOrderMaterialIssue**: Material issue/return tracking (`workOrderId`, `sku`, `qty`, `unitCost`, `totalCost`, `lotId`, `type`, `issuedAt`, `issuedBy`, `notes`)
- **ScrapRecord**: Scrap tracking (`workOrderId`, `sku`, `qty`, `reason`, `cost`, `recordedAt`, `recordedBy`)
- **VarianceReport**: Variance calculation and posting (`workOrderId`, `type`, `standardCost`, `actualCost`, `variance`, `variancePercent`, `reason`, `posted`, `postedAt`, `createdBy`)

### Metrics Store (Star Schema)

**Dimension Tables**:
- **DimDate**: Date dimension (`date`, `year`, `quarter`, `month`, `week`, `day`, `dayOfWeek`, `isWeekend`, `isHoliday`, `fiscalYear`, `fiscalQuarter`)
- **DimTenant**: Tenant dimension (`tenantId`, `name`, `region`, `industry`, `createdAt`)
- **DimCustomer**: Customer dimension (`tenantId`, `customerId`, `code`, `name`, `type`, `industry`, `region`, `createdAt`, `updatedAt`)
- **DimProduct**: Product dimension (`tenantId`, `sku`, `name`, `category`, `brand`, `unitOfMeasure`, `createdAt`, `updatedAt`)
- **DimLocation**: Location/warehouse dimension (`tenantId`, `warehouseId`, `locationId`, `warehouseCode`, `locationCode`, `warehouseName`, `locationName`, `type`, `createdAt`, `updatedAt`)
- **DimProject**: Project dimension (`tenantId`, `projectId`, `code`, `name`, `customerId`, `status`, `createdAt`, `updatedAt`)
- **DimChannel**: Channel dimension (`tenantId`, `channelId`, `code`, `name`, `type`, `createdAt`, `updatedAt`)

**Fact Tables**:
- **FactInvoice**: Invoice facts (`dateId`, `tenantDimId`, `customerDimId`, `invoiceId`, `invoiceNumber`, `total`, `tax`, `discount`, `net`, `currency`, `status`, `createdAt`)
- **FactOrder**: Order facts (`dateId`, `tenantDimId`, `customerDimId`, `orderId`, `orderNumber`, `total`, `currency`, `status`, `createdAt`)
- **FactReceipt**: POS receipt facts (`dateId`, `tenantDimId`, `customerDimId`, `channelDimId`, `receiptId`, `receiptNumber`, `total`, `discount`, `tax`, `net`, `currency`, `paymentMethod`, `createdAt`)
- **FactProjectWip**: Project WIP facts (`dateId`, `tenantDimId`, `projectDimId`, `customerDimId`, `wipLedgerId`, `amount`, `currency`, `type`, `billed`, `createdAt`)
- **FactInventoryMovement**: Inventory movement facts (`dateId`, `tenantDimId`, `productDimId`, `locationDimId`, `stockMoveId`, `qty`, `unitCost`, `totalCost`, `type`, `createdAt`)
- **FactWorkOrder**: Work order facts (`dateId`, `tenantDimId`, `productDimId`, `workOrderId`, `workOrderNumber`, `qty`, `status`, `materialCost`, `labourCost`, `overheadCost`, `totalCost`, `createdAt`)

---

## Indexes Added

All new models include appropriate indexes:
- `tenantId` indexes on all tenant-scoped tables
- Foreign key indexes
- Status/date indexes for common queries
- Composite indexes for frequent query patterns

---

## Relations Updated

- **Customer**: Added `posSales` relation
- **PosSession**: Added `sales`, `cashMovements`, `zReports` relations
- **Project**: Added `wipLedger`, `billingSchedules` relations
- **ProjectPhase**: Added `wipLedger`, `billingSchedules` relations
- **Warehouse**: Added `stockMoves`, `cycleCountPlans`, `shipments` relations
- **Location**: Added `stockMovesFrom`, `stockMovesTo`, `putawayTasksFrom`, `putawayTasksTo`, `cycleCountLines` relations
- **InventoryLot**: Added `stockMoves`, `workOrderMaterialIssues` relations
- **WorkOrder**: Added `materialIssues`, `scrapRecords`, `varianceReports` relations
- **CrmOpportunity**: Added `stageHistory`, `activities`, `quotes` relations
- **SalesQuote**: Added `opportunity` relation
- **CrmActivity**: Added `opportunity` relation

---

## Migration Status

**Schema Validation**: ✅ PASSED (`pnpm prisma validate`)

**Prisma Client Generation**: ✅ READY (will be generated on migration)

**Migration File**: To be created when running `pnpm prisma migrate dev --name "depth-pass-core-schema"` against staging database

---

## Next Steps

1. **Create Migration**:
   ```bash
   cd apps/web
   export DATABASE_URL="[STAGING_DATABASE_URL]"
   pnpm prisma migrate dev --name "depth-pass-core-schema"
   ```

2. **Apply to Staging**:
   ```bash
   pnpm prisma migrate deploy
   ```

3. **Run Tests**:
   ```bash
   pnpm test
   pnpm test:e2e:smoke
   pnpm december:ready
   ```

4. **Fix Any Issues**: Update application code and tests to align with new schema

5. **Update Documentation**: Add "Applied Schema Changes" section to design docs

---

## Notes

- All models follow existing patterns: `tenantId` non-nullable, audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt` where appropriate)
- All foreign keys respect tenant boundaries
- Cascade behavior is explicit and safe
- Event reference fields (`sourceEventId`) included where needed for event-bus integration
- Metrics star schema is complete with all dimensions and facts

---

**Last Updated**: 2025-01-18

