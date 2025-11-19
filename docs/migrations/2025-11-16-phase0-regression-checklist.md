Last updated: 2025-11-16

Purpose
- Canonical checklist for Phase 0.3 regression after unified schema apply and code‑switch. Execute on staging first, then on production post‑deploy.

General notes
- Use a SUPER_ADMIN and a tenant ADMIN account for coverage.
- Confirm no cross‑tenant leakage. Verify rate limits and audit trails where applicable.

Finance
- Flow: Create invoice → approve → pay → verify GL posting + VAT totals
- UI: /finance/invoices, /finance/reports
- API: POST /api/finance/ar/invoice/approve, POST /api/finance/ar/invoice/pay, GET /api/finance/reports/{pnl,trial-balance,balance-sheet}
- Invariants:
  - VAT totals match line VAT; totals consistent across report endpoints.
  - Journal entries balanced (debits == credits).

Inventory & WMS
- Flow: GRN for PO → stock on hand updates → stock move → valuation report
- UI: /inventory/items, /inventory/stock-movements, /inventory/valuation (if present)
- API: POST /api/inventory/grn, GET /api/inventory/reports/valuation
- Invariants:
  - Stock on hand never negative.
  - FIFO/LIFO/Weighted rules (as configured) respected in valuation.

Manufacturing
- Flow: Release WO → consume BOM → complete WO → variance report
- UI: /manufacturing/work-orders, /manufacturing/bom, /manufacturing/variance
- API: POST /api/manufacturing/workorder/consume-bom, POST /api/manufacturing/cost/rollup
- Invariants:
  - Component consumption reduces lot/on‑hand accordingly.
  - Variance totals reconcile with costs and issues/scrap.

CRM & Sales
- Flow: Lead → Opportunity → Quote approve → Sales Order create → Invoice from order
- UI: /sales/leads, /sales/opportunities, /sales/quotes, /sales/orders
- API: /api/crm/*, /api/sales/order/create, /api/sales/invoice/from-order
- Invariants:
  - Stage transitions audited; amounts/close dates retained.
  - Quote approval required prior to SO.

Projects & PSA
- Flow: Log timesheet → approve timesheet → billing export → KPI roll‑up
- UI: /projects/time, /projects/billing
- API: /api/projects/timesheets, /api/projects/timesheets/rollup
- Invariants:
  - Approved entries locked from edits.
  - Billing totals equal approved time × rate; roll‑ups match detail.

POS
- Flow: Open session → sale → payment → close session → finance entry
- UI: /pos/register, /pos/receipts, /pos/sessions
- API: /api/pos/sale/finalise
- Invariants:
  - Session totals reflect receipt totals; tenders reconcile.
  - Finance entry created and balanced.

HR / Payroll
- Flow: Create pay run → generate payslips → post run → verify journal
- UI: /hr/payroll
- API: /api/hr/payroll/run
- Invariants:
  - Payslip lines sum to net; journals balanced.
  - Leave balances updated when leave is posted.

Healthcare
- Flow: Create rota → edit shifts → save → check cost‑of‑care dashboard
- UI: /healthcare/rota, /healthcare/cost-of-care (if present)
- API: /api/healthcare/rota
- Invariants:
  - Shift counts and totals match saved entries.
  - Cost‑of‑care reflects finance/inventory inputs where applicable.

Workflow
- Flow: Create definition → start instance → approve step(s) → instance completes
- UI: /workflow/definitions, /workflow/instances
- API: /api/workflow/{definitions,instances}/*
- Invariants:
  - Instance transitions valid; approvals required where configured.
  - Audit entries emitted on transitions.

Custom Fields
- Flow: Create field def → assign to entity → create/update values → verify UI rendering
- UI: /settings/custom-fields
- API: /api/custom/{fields,values}
- Invariants:
  - Values persist and render on target forms; constraints enforced.

Observability & Public Health
- UI/API:
  - /api/health → 200 public (after middleware change task)
  - /api/status → 200 public (after middleware change task)
  - /api/kpi/** remains authenticated
- Invariants:
  - Health/status never leak secrets; include minimal, non‑PII diagnostics.


