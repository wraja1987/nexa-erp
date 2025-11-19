Last updated: 2025-11-16

Purpose
- Describe current dimension support in Finance and what can be safely enabled without schema changes.

Available now in schema (observed)
- Core Finance tables: `JournalEntry`, `JournalLine`, `Account`, `CustomerInvoice`, `SupplierBill` with `tenantId` scoping.
- No explicit dimension fields (e.g., cost center, department, project) on `JournalLine`, `CustomerInvoice`, or related finance rows in the current schema.

Missing or partial; requires Task 2/schema work later
- Dimension catalogs (e.g., `DimensionDef`, `DimensionValue`) and assignments.
- Links from `JournalLine` and/or `InvoiceLine` to dimension values (e.g., `costCenterId`, `departmentId`, `projectId`, `regionId`).
- User dimension access guards (optional) and dimension-aware indexes.

Phase 1 behaviour (implemented now)
- APIs accept optional dimension filters (dimensionType, dimensionValues) and validate gracefully.
- Since no dimension fields exist on key finance rows, filters are acknowledged but not applied (reported as unsupported in responses where relevant).
- Reports remain tenant/legal-entity scoped as before.

Notes
- Once Task 2 adds dimension link fields and catalogs, the helper layer can start generating Prisma where-clauses to filter by those dimensions across P&L, Balance Sheet, Trial Balance, and Revenue reports.


