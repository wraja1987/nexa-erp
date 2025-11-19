# Task 8 Gap Closure — Database Migration Plan

**Date**: 2025-01-18  
**Status**: Schema Design Complete, Migration Pending

---

## Purpose

This document tracks the Prisma schema changes required to close all Task 8 gaps and enable full DB-backing for all modules.

---

## Schema Changes Summary

### Models Added (60+)

#### Phase 6 — Purchasing
- `BlanketPO`, `BlanketPOLine`, `BlanketPORelease`
- `SupplierContract`, `SupplierContractTier`
- `LandedCost`
- `SupplierPerformance`

#### Phase 7 — Projects/PSA
- `Project`, `ProjectPhase`, `ProjectTask`
- `Timesheet`
- `ProjectRetainer`
- `ProjectInvoiceLine`

#### Phase 8 — Sales + CRM
- `Customer` (master)
- `CrmAccount`, `CrmContact`, `CrmActivity`, `CrmOpportunity`
- `SalesQuote`, `SalesQuoteLine`
- `SalesOrder`, `SalesOrderLine`
- `Reservation`

#### Phase 9 — POS
- `PosSession`
- `PosDrawer`
- `PosPromotion`
- `PosVariance`

#### Phase 10 — Tax + Compliance
- `TaxCode`, `TaxRate`
- `HmrcMtdSubmission`
- `GccEinvoicePayload`
- Added `tenantId` to `VatReturn`

#### Phase 11 — Analytics
- `MetricPoint`
- `MetricsSnapshot`

#### Phase 13 — Admin + Config
- `Partner`, `PartnerTenant`, `PartnerRevenueShare`
- `TenantConfig`

#### Phase 14 — Healthcare
- `Practice`, `Pcn`, `PracticePcn`
- `HealthcareRotaHeader`, `HealthcareRotaShift`, `HealthcareRotaAssignment`
- `ArrsRole`, `ArrsAssignment`
- `LocumAssignment`
- `HealthcareClaim`, `ArrsClaim`

#### Phase 16 — Attachments
- `Attachment`

#### Phase 17 — Import/Export
- `ImportJob`, `ImportJobItem`
- `PriceList`, `PriceListItem`

#### Phase 18 — Event Bus
- `OutboxEvent`
- `EventSubscription`

#### Phase 19 — BYOK + Residency
- `TenantKey`
- `BackupPolicy`, `BackupRun`

#### Phase 24 — Workflow
- `WorkflowDefinition`, `WorkflowInstance`, `WorkflowHistory`

#### Phase 25 — Custom Fields
- `CustomFieldDefinition`, `CustomFieldValue`

#### Phase 26 — Planning
- `SafetyStock`
- `PlanningSnapshot`
- `PlanRecommendation`

#### Phase 27 — User Management
- `Department`, `Team`
- `UserDepartment`, `UserTeam`
- Added `status` field to `Tenant`

#### Phase 28 — Agent Logs
- `AgentRun`, `AgentStep`
- `AgentConfig`

---

## Migration Steps

### Step 1: Validate Schema
```bash
pnpm -w prisma format
pnpm -w prisma validate
```

### Step 2: Generate Migration (Staging)
```bash
pnpm -w prisma migrate dev --name task8_gap_closure --create-only
```

### Step 3: Review Migration SQL
- Check for backwards compatibility
- Verify indexes are created
- Ensure foreign keys are correct

### Step 4: Apply to Staging
```bash
pnpm -w prisma migrate deploy
```

### Step 5: Verify Staging
- Run all Phase 23 checks
- Test critical flows
- Verify no data loss

### Step 6: Apply to Production
```bash
# After staging verification
pnpm -w prisma migrate deploy
```

---

## Backwards Compatibility

All changes are additive:
- No DROP TABLE statements
- No DROP COLUMN statements
- New fields have defaults where appropriate
- Existing data remains intact

---

## Index Strategy

All new models include:
- `tenantId` index (for multi-tenancy)
- Composite indexes for common query patterns
- Foreign key indexes

---

## Next Steps

1. ✅ Schema design complete
2. ⏳ Generate migration
3. ⏳ Apply to staging
4. ⏳ Verify staging
5. ⏳ Apply to production
6. ⏳ Replace all stubs with real implementations

---

## Notes

- This is a large migration (~60+ new tables)
- Estimated migration time: 5-10 minutes on staging
- Rollback plan: Restore from backup if needed
- All new models are tenant-scoped

