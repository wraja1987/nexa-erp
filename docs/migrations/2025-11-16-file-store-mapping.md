Last updated: 2025-11-16

Purpose
- Inventory current JSON/file/in-memory stores by module and define their target Prisma model families in the unified enterprise schema. Mark legacy/deprecated stores for removal once code‑switch completes.

Method
- Repo scan did not surface explicit “*Store.ts” or “.data” sources in this branch. The mapping below reflects canonical Nexa ERP store families to ensure zero gaps if any legacy stores are present in other environments/branches.

Legend
- Detected in repo: none (this branch)
- Legacy/deprecated: to be removed after code‑switch
- Target: Prisma model family in 2025‑11 Enterprise Schema

Finance
- Legacy/deprecated: file/in‑memory “invoice”, “bill”, “payment” caches (if any)
- Target: Invoice, InvoiceLine; Bill, BillLine; Payment; Journal, JournalLine; VatReturn

Inventory & WMS
- Legacy/deprecated: cycle count plans/results, quality holds, replenishment suggestions kept in files (if any)
- Target: Item, ItemCategory, Warehouse, Location, InventoryLot, StockMove; CycleCountPlan, CycleCountLine; QualityHold; ReplenishmentProposal

Manufacturing
- Legacy/deprecated: WIP transactions, BOM consumption, scrap logs in files (if any)
- Target: Bom, BomComponent; WorkOrder, WorkOrderOperation; WipTransaction; VarianceReport

CRM & Sales
- Legacy/deprecated: leads, accounts, contacts, activities, opportunities, quotes in JSON (if any)
- Target: Lead, Account, Contact, Activity, Opportunity, Quote; SalesOrder, SalesOrderLine; CreditNote

Planning & Budgeting
- Legacy/deprecated: budgets/forecasts JSON (if any)
- Target: Budget, BudgetLine; Forecast, ForecastLine

Workflow
- Legacy/deprecated: workflowDefinition/workflowInstance stores (if any)
- Target: WorkflowDefinition, WorkflowStep; WorkflowInstance, WorkflowAction

Custom Fields
- Legacy/deprecated: customFieldDef/customFieldValue files (if any)
- Target: CustomFieldDef, CustomFieldValue (polymorphic target)

Healthcare
- Legacy/deprecated: rota/shift JSON, cost‑of‑care interim files (if any)
- Target: RotaHeader, RotaShift; CareEpisode; CareMetric

POS
- Legacy/deprecated: sessions, receipts, EOD summaries in files (if any)
- Target: PosRegister, PosSession; PosReceipt, PosReceiptLine; PosPayment

Projects & PSA
- Legacy/deprecated: timesheet entries/approvals and billing exports in files (if any)
- Target: Project, Task; TimesheetEntry, TimesheetApproval; BillingBatch, BillingLine

HR / Payroll
- Legacy/deprecated: pay runs/payslips in files (if any)
- Target: Employee; PayRun; PaySlip, PaySlipLine; LeaveRequest

Dimensions & Org
- Legacy/deprecated: ad‑hoc dimension value mappings in files (if any)
- Target: DimensionDef, DimensionValue; entity‑dimension link tables

Events & Outbox
- Legacy/deprecated: ad‑hoc event logs as JSON (if any)
- Target: OutboxEvent, EventSubscription

Attachments
- Legacy/deprecated: path lists in JSON (if any)
- Target: Attachment (ownerType/ownerId, url/hash, metadata)

Metrics & AI Engine
- Legacy/deprecated: metrics snapshots/AI logs as files (if any)
- Target: MetricSample; AiIntentLog

Audit v2
- Legacy/deprecated: per‑feature ad‑hoc audit JSON (if any)
- Target: AuditEventV2

Removal policy after code‑switch
- Remove all legacy file stores and their write paths once the corresponding Prisma repositories are live, backfilled, and validated via regression suite. Retain export‑only archival where explicitly required by compliance.


