Last updated: 2025-11-16

Purpose
- Prepare the unified, additive Prisma schema and migration path to move all remaining subsystems to fully DB‑backed repositories.

Who should read this
- Engineers applying Task 8 (Enterprise Build) Phase 0 migrations; release managers verifying Neon staging→prod apply; SRE validating rollback safety.

Scope and constraints
- Additive‑only changes: no DROP TABLE/COLUMN; no narrowing of types.
- Multi‑tenant: every new table has tenantId with appropriate indexes.
- RBAC and rate limits preserved; no auth/middleware edits in this doc.
- This plan produces Prisma migrations to be applied in staging first, then production after snapshot and verification.

Model families to add (high‑level)
1) Supply Chain
   - RFQ, RFQResponse, RFQAward
   - SupplierContract, ContractTier
   - SupplierScorecard
   - CycleCountPlan, CycleCountLine
   - RMAHeader, RMALine
   - PickWave, PickTask, Pack, Shipment
2) CRM & Sales
   - Lead, Account, Contact, Activity, Opportunity
   - Quote, SalesOrder (header/line), CreditNote (header/line)
3) Planning & Budgeting
   - Budget (header/line), Forecast (header/line)
4) Workflow
   - WorkflowDefinition, WorkflowStep, WorkflowInstance, WorkflowAction
5) Custom Fields
   - CustomFieldDef, CustomFieldValue (polymorphic target)
6) Healthcare
   - Rota (Header/Shift), CareEpisode, CareMetric
7) POS
   - PosRegister, PosSession, PosReceipt (header/line), PosPayment
8) HR / Payroll (extended)
   - Employee (extended), PayRun, PaySlip (line items), LeaveRequest
9) Projects & PSA
   - Project, Task, Timesheet (entry/approval), BillingBatch
10) Dimensions & Org
   - DimensionDef, DimensionValue, Warehouse/Site/CostCentre links
11) Events & Outbox
   - OutboxEvent (status, topic, payload, attempts, nextAttemptAt)
   - EventSubscription (typed topic, sink, enabled)
12) Attachments
   - Attachment (ownerType/ownerId, url/hash, metadata)
13) Metrics store
   - MetricSample (name, ts, dims JSONB, value), Materialized KPI tables (optional, additive)
14) AI Engine logs
   - AiIntentLog (intent, scope, input hash, decision, stats)
15) Audit v2
   - AuditEventV2 (actor, tenantId, targetType/Id, action, payload digest, ip/ua, ts)

Relations & indexing (representative rules)
- Every table: tenantId STRING indexed; composite (tenantId, key/date) per access path.
- FK indexes for all relations: e.g., (rfqId), (contractId), (projectId), (accountId).
- Search‑heavy: add GIN index on JSONB payloads where applicable (values/dims).
- Outbox: composite (status, nextAttemptAt), (topic, createdAt).
- Timeseries: (name, ts), (tenantId, name, ts DESC) for metrics and logs.

Composite Index Strategy
- Finance
  - Invoices by tenant, status, due date desc → (tenantId, status, dueDate DESC)
  - Payments by tenant, method, createdAt desc → (tenantId, method, createdAt DESC)
  - Journals by tenant, period, accountId → (tenantId, period, accountId)
  - VAT returns by tenant, periodStart, periodEnd → (tenantId, periodStart, periodEnd)
- Inventory & WMS
  - Stock moves by tenant, sku, movedAt desc → (tenantId, sku, movedAt DESC)
  - Lots by tenant, sku, warehouseId, expiry → (tenantId, sku, warehouseId, expiry)
  - Cycle count lines by planId, sku → (planId, sku)
  - Replenishment by tenant, sku, recommendedDate → (tenantId, sku, recommendedDate)
- Manufacturing
  - WOs by tenant, status, scheduledDate → (tenantId, status, scheduledDate)
  - WIP transactions by woId, occurredAt → (woId, occurredAt)
  - BOM components by bomId, seq → (bomId, seq)
- CRM & Sales
  - Leads by tenant, status, createdAt desc → (tenantId, status, createdAt DESC)
  - Opportunities by tenant, stage, expectedClose → (tenantId, stage, expectedClose)
  - Quotes by tenant, status, updatedAt desc → (tenantId, status, updatedAt DESC)
  - SOs by tenant, status, createdAt desc → (tenantId, status, createdAt DESC)
- Projects & PSA
  - Timesheets by tenant, projectId, workDate → (tenantId, projectId, workDate)
  - Billing batches by tenant, status, createdAt → (tenantId, status, createdAt)
- POS
  - Sessions by tenant, registerId, openedAt → (tenantId, registerId, openedAt)
  - Receipts by tenant, sessionId, createdAt → (tenantId, sessionId, createdAt)
- Healthcare
  - Rota shifts by tenant, rotaId, shiftDate → (tenantId, rotaId, shiftDate)
  - Care metrics by tenant, episodeId, ts → (tenantId, episodeId, ts)
- Cross‑cutting
  - Attachments by ownerType/ownerId, createdAt → (ownerType, ownerId, createdAt)
  - Outbox by status, nextAttemptAt → (status, nextAttemptAt)
  - Audit v2 by tenant, targetType/Id, at → (tenantId, targetType, targetId, at)
  - Metrics by tenant, name, ts desc → (tenantId, name, ts DESC)

Outbox & events (typed)
- Topics: inventory.adjusted, finance.invoice.posted, sales.order.created, pos.sale.finalised, projects.timesheet.approved, workflow.instance.updated, ai.intent.logged.
- OutboxEvent payloads schema‑versioned (payloadVersion, payload JSON).
- EventSubscription sink types: internal handler, webhook (retry with backoff).

Code‑switch strategy (no code changes in this doc)
- Replace each file store with a Prisma repository:
  - supply/*Store.ts → supplyRepo/* (RFQ, Contracts, RMA, Pick/Pack/Ship, Cycle)
  - crm/*Store.ts → crmRepo/* (Leads, Accounts, Contacts, Opps, Quotes)
  - planning/*Store.ts → planningRepo/*
  - workflow/workflowStore.ts → workflowRepo/*
  - custom/customFieldStore.ts → customRepo/*
  - healthcare/rotaStore.ts → healthcareRepo/*
  - pos/*Store.ts → posRepo/*
  - projects/time/billing stores → projectsRepo/*
- Keep public service interfaces stable; inject repo via factory for easy flagging.

Indexing & query tuning plan
- Add composite indexes called out above.
- Enable slow‑query logging on staging; capture and remediate N+1 and full scans on dashboards (dashboard KPIs, list pages, search endpoints).
- Verify pagination paths use indexed cursors (id, createdAt) where appropriate.

Regression sweep (post‑apply)
- Finance: invoice approve/pay; VAT submit; GL postings.
- Inventory: GRN → on‑hand update; item valuation; cycle count post variance.
- Manufacturing: BOM consume; WO complete; variance reports.
- CRM/Sales: lead→opp→quote→order→invoice; quote approve; credit note flow.
- Projects: timesheet approve; billing export/roll‑up.
- POS: session open/close; sale finalise; tender types; finance entry.
- HR/Payroll: payrun, payslip lines; leave approvals.

Observability endpoints (separate task)
- Keep /api/kpi/** authenticated.
- Make /api/health and /api/status public 200 (middleware bypass) in a later auth/runtime task; add CI checks then.

Prisma migration & Neon steps (staging → prod)
1) Generate migrations locally (additive only)
   - pnpm -w prisma generate
   - pnpm -w prisma migrate dev --create-only --name 2025-11-enterprise-unified
   - Review SQL: ensure only CREATE TABLE, ALTER TABLE ADD COLUMN, CREATE INDEX.
2) Apply to staging
   - export DATABASE_URL=\"$(sed -n 's/^DATABASE_URL_STAGING=//p' .env.local)\"
   - pnpm -w prisma migrate deploy --schema=apps/web/prisma/schema.prisma
   - pnpm -w prisma generate
   - Smoke: pnpm -w typecheck && DATABASE_URL=\"$DATABASE_URL\" pnpm -w build
3) Neon production safety
   - Create prod snapshot/branch (Neon console), name: nexa-prod-pre-task8-<ts>
4) Apply to production
   - export DATABASE_URL=\"$(sed -n 's/^DATABASE_URL=//p' .env.local)\"
   - pnpm -w prisma migrate deploy --schema=apps/web/prisma/schema.prisma
   - pnpm -w prisma generate
5) Seed/backfill (idempotent)
   - Idempotent upserts for: POS tender types; CRM stages; workflow states; default dimensions; event subscriptions (disabled by default); baseline metrics seeds.
6) Rollback plan
   - Git: tag pre‑task8 and post‑task8 commits.
   - Neon: restore from snapshot nexa-prod-pre-task8-<ts> if required.
   - Prisma: never destructive; revert code to pre‑task8 to ignore new tables.

Acceptance checklist
- [ ] Migrations are purely additive.
- [ ] Staging migrate deploy succeeds; build passes.
- [ ] Production snapshot captured.
- [ ] Production migrate deploy succeeds.
- [ ] Seeds run idempotently.
- [ ] Regression sweep passes (representative flows).

Apply & Rollback Procedure
Staging‑first
1) Generate migrations (additive only) and review SQL (CREATE TABLE / ADD COLUMN / CREATE INDEX only).
2) Apply to staging:
   - export DATABASE_URL="$(sed -n 's/^DATABASE_URL_STAGING=//p' .env.local)"
   - pnpm -w prisma migrate deploy --schema=apps/web/prisma/schema.prisma
   - pnpm -w prisma generate
3) Seeds (idempotent upserts): CRM stages, workflow states, POS tender types, default dimensions, event subscriptions (disabled), baseline metrics.
4) Smoke:
   - pnpm -w typecheck
   - DATABASE_URL="$DATABASE_URL" pnpm -w build
   - Representative API/UI sanity checks

Production
1) Create Neon snapshot/branch for production (name: nexa-prod-pre-task8-<ts>).
2) Apply to production:
   - export DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.local)"
   - pnpm -w prisma migrate deploy --schema=apps/web/prisma/schema.prisma
   - pnpm -w prisma generate
3) Run idempotent seeds; perform post‑deploy smokes.

Rollback
1) If migration issues arise:
   - Restore Neon production from snapshot nexa-prod-pre-task8-<ts>.
   - Revert app to pre‑task8 tag; do not run destructive SQL.
2) If only app defects:
   - Roll back deployment to pre‑task8 tag; DB remains additive‑extended.
3) Document incident, root cause, and follow‑up indexes/fixes as needed.


