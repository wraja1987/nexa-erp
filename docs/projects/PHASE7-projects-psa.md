Last updated: 2025-11-16

Purpose
- Implement Projects/PSA/Job Costing on the locked schema with safe subsets. This document inventories existing schema and gaps, and explains how unsupported features are surfaced as read-only or 501.

Schema inventory (from prisma/schema.prisma)
- Project-related core entities: NOT PRESENT
  - No Project, ProjectPhase, Task, TimesheetEntry, TimesheetApproval, Retainer models.
- Finance references available:
  - Invoice (header only; no InvoiceLine model).
  - JournalEntry / JournalLine (general ledger postings).

Phase 7 requirements — Available Now vs Missing

1) Project structure (codes/phases/budget)
- Available: none (no Project/Phase models).
- Missing: Project master (code, name, customer, status), phases, budgets; therefore:
  - listProjects returns empty.
  - create/update project → 501 (schema gap).
  - phases list empty; create/update → 501.

2) Timesheets
- Available: none.
- Missing: timesheet entry/approval models; therefore:
  - listTimesheets returns empty.
  - create/approve → 501 (schema gap).

3) Billing (T&M, milestone, fixed)
- Available: Invoice header exists, but no InvoiceLine; no explicit linkage to projects/phases.
- Missing: invoice lines; billable phase markers; contract/budget fields; therefore:
  - buildBillingPreview → 501 with clear message.
  - createProjectInvoice → 501.

4) Retainers
- Available: none.
- Missing: retainer tables; therefore:
  - listRetainers returns empty.
  - create/apply → 501.

5) WIP + profitability
- Available: JournalEntry/JournalLine; Invoice (header).
- Missing: project linkage fields, cost classifications; therefore:
  - getWipSummary/getProfitability return `{ supported: false, message: "schema gap: missing project/timesheet/billing links" }`.

RBAC & tenancy
- All endpoints enforce ui:projects:view/ui:projects:edit and assert legal entity/tenant scope.


