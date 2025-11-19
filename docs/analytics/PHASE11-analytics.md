Last updated: 2025-11-16

Purpose
- Implement Analytics (Phase 11) on locked schema using only existing models and KPI infra.

Inventory
- Prisma models relevant to analytics: CustomerInvoice, SupplierBill, CustomerPayment, SupplierPayment, JournalEntry/Line, Account, Warehouse, Location, InventoryItem, WorkOrder, PurchaseOrder, Employee, PayrollRun, VatReturn (no tenantId).
- KPI endpoints present: `/api/kpi/*` exist (dashboard, invoices, revenue, etc.) but persistence store for metrics is not present.
- Metrics store model (MetricSample or similar): NOT present.

Available vs Missing
- Metrics store: Missing → Phase 11 uses virtual/on-demand KPIs only.
- ETL jobs: No scheduler, no metrics table. Implement pure functions returning snapshots without persistence.
- KPIs per module:
  - Finance: Available (GL/AR/AP/Invoices/Bills).
  - Banking: Available (cash position, reconciliation services from prior phases).
  - HR: Available (Employee, PayrollRun).
  - Inventory: Available (Warehouse/Location/InventoryItem).
  - Manufacturing: Available (WorkOrder basic counts).
  - Purchasing: Available (PurchaseOrder counts).
  - Projects/Sales/CRM/POS/Tax: Partial/missing models → mark supported:false with schema gap notes.
- Analytics UI + drilldowns: Build overview, per-module, and snapshots pages with schema-gap messaging.

Phase 11 implementation (given locked schema)
- Virtual KPIs computed via Prisma/services; no persisted metrics store.
- ETL functions return snapshots only (no writes).
- API routes for all KPIs, module KPIs, metrics query (unsupported), ETL snapshot.
- UI pages: overview, module drilldown, snapshots.


