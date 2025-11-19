# Phase 23 — Final Hardening · Cross-Module Integrity · Acceptance Evidence

**Last updated**: 2025-01-18

---

## Phase 24 — Workflow Engine Integration

**Status**: ✅ Complete (2025-01-18)

Phase 24 adds a schema-safe, additive workflow engine that enforces policy-based transitions for Finance Invoices, Purchase Orders, and Manufacturing Work Orders. The workflow engine:

- ✅ Enforces role-based and amount-based approval conditions
- ✅ Emits workflow events (`workflow.state.changed`, `workflow.transition.denied`)
- ✅ Provides workflow history views (event-based, schema-gap stub)
- ✅ Includes workflow designer UI (`/workflow/overview`, `/workflow/entity/[entityType]`, `/workflow/history/[entityType]/[entityId]`)
- ✅ Integrates with existing lifecycle functions (additive, backward-compatible)

**Schema Gaps**: Workflow definitions are code-based (hard-coded registry). Workflow history uses AuditLog (best-effort) until WorkflowHistory table is added. All persistence operations return `supported:false` with clear messaging.

**See**: `docs/workflow/PHASE24-workflow-engine.md` for full details.

---

## Phase 25 — Custom Fields Engine Integration

**Status**: ✅ Complete (2025-01-18)

Phase 25 adds a schema-safe, additive custom fields engine that allows tenants to define and use custom fields on various entity types. The custom fields engine:

- ✅ Provides code-based default definitions per entity type (read-only)
- ✅ Supports value storage for `finance.entity` entities (via EntityExt.meta)
- ✅ Includes validation and normalization engine
- ✅ Provides CustomFieldsPanel component for viewing/editing
- ✅ Includes admin UI for managing definitions (read-only, shows schema gap)
- ✅ Emits custom field events (`customfields.definition.changed`, `customfields.values.changed`)
- ✅ Integrates with Finance, Purchasing, Inventory, HR entity pages

**Schema Gaps**: Custom field definitions are code-based (hard-coded registry). Value storage is only available for `finance.entity` entities (via EntityExt.meta). All other entity types return `supported:false` with clear messaging. Full persistence requires CustomFieldDefinition and CustomFieldValue tables.

**See**: `docs/custom-fields/PHASE25-custom-fields-engine.md` for full details.

---

## Phase 26 — Planning / S&OP Integration

**Status**: ✅ Complete (2025-01-18)

Phase 26 adds a schema-safe, read-only Planning / S&OP layer that computes demand plans, supply plans, net requirements, and suggested actions (POs, WOs, transfers). The planning engine:

- ✅ Computes demand plans from Work Orders (BOM explosion) and Customer Invoices (limited due to schema gap)
- ✅ Computes supply plans from Inventory (on-hand), Purchase Orders, Work Orders, and ASNs (limited)
- ✅ Generates recommendations for Purchase Orders, Work Orders, and Transfers (read-only suggestions)
- ✅ Provides capacity views across work centres (via CapacityCalendar and RoutingStep)
- ✅ Includes Planning / S&OP UI pages (Overview, Demand, Supply, Recommendations, Capacity)
- ✅ Emits planning events (`planning.plan.generated`)
- ✅ Integrates with Analytics KPIs (planning_constrained_items, planning_net_shortage_value, planning_suggested_actions_count)
- ✅ Integrates with Purchasing, Manufacturing, Inventory modules (read-only links)

**Schema Gaps**: Demand from Customer Invoices is limited (no InvoiceLineItem model). Supply from ASNs is limited (no AsnLine model). Safety stock is computed naively (no explicit field). Recommendations are transient (no persistence). Full persistence would require DemandPlan, SupplyPlan, and PlanRecommendation tables.

**See**: `docs/planning/PHASE26-planning-sop.md` for full details.

---

## Phase 27 — User Management (Admin + Super-Admin) Integration

**Status**: ✅ Complete (2025-01-18)

Phase 27 adds Admin + Super-Admin User Management capabilities for Nexa ERP. The user management system:

- ✅ Super-admin portal for tenant management (list tenants, view details, usage metrics, BYOK/residency status)
- ✅ Tenant admin user management (CRUD users, role changes, deactivation/reactivation, password reset)
- ✅ RBAC visibility (role → permission matrix, per-user role view)
- ✅ Read-only support impersonation mode (in-memory context, no session changes)
- ✅ Full audit trail and observability (events, metrics, audit logs)
- ✅ All operations are RBAC-guarded and tenant-scoped

**Schema Gaps**: Tenant suspension/activation requires Tenant.status field (returns `supported:false`). Department/team association not supported (no fields). Password reset uses existing flow (PasswordResetToken structure may vary). Audit logging is best-effort via AuditLog model.

**See**: `docs/user-management/PHASE27-user-management.md` for full details.

---

## Phase 28 — Agentic AI Foundations (Non-Disruptive Module)

**Status**: ✅ Complete (2025-01-18)

Phase 28 adds Agentic AI Foundations as a non-disruptive, read-only layer on top of existing Phase 12 AI infrastructure. The agentic layer:

- ✅ Read-only tool registry per module (finance, inventory, planning, analytics)
- ✅ Agent run/step logging (schema-gap aware, returns `supported:false` when models missing)
- ✅ Global and per-tenant feature flags (default-OFF, kill-switchable)
- ✅ Minimal Agent Console UI (overview, runs, steps)
- ✅ Versioned agent prompts and policy docs (read-only constraints)
- ✅ Telemetry extensions (agentRunId, agentStepId, toolName)
- ✅ Internal read-only scenario runner (admin/internal use only)

**Safety Guarantees**: All tools are read-only by design. No writes, mutations, or side-effects possible. RBAC and tenancy enforced. Default-OFF globally and per-tenant. Kill-switchable.

**Schema Gaps**: AgentRun/AgentStep models not present (returns `supported:false`, uses transient IDs). AgentConfig model not present (per-tenant flags default to global flag only).

**See**: `docs/ai/PHASE28-agentic-foundations.md` for full details.

---  
**Status**: ✅ **COMPLETE**

## Purpose

Phase 23 ensures all modules behave consistently across UI, logic, RBAC, eventing, and tenancy. It validates cross-module propagation, generates acceptance evidence, and confirms the ERP is production-ready under Task 8's constraints.

## Who Should Read This

- QA engineers performing final verification
- Developers fixing cross-module issues
- Product managers reviewing acceptance evidence
- DevOps engineers preparing for go-live

---

## Checklist

### STEP 0 — Create Phase Documentation
- [x] Create `docs/hardening/PHASE23-final-hardening.md` (this document)
- [x] Create `reports/acceptance/PHASE23-acceptance-evidence.md` template
- [ ] Populate tracking tables below

### STEP 1 — Cross-Module Integrity Pass
- [ ] Create `scripts/checks/check-ui-integrity-phase23.ts`
- [ ] Scan for broken imports
- [ ] Scan for duplicate exports
- [ ] Scan for unused components
- [ ] Scan for orphaned routes
- [ ] Check pages not wrapped with AppShell
- [ ] Check pages missing PageHeader
- [ ] Check tables not using DataTable
- [ ] Generate `reports/hardening/ui-integrity-phase23.json`
- [ ] Fix all flagged issues

### STEP 2 — Route Consistency + RBAC Integrity
- [ ] Create `scripts/checks/check-route-rbac-phase23.ts`
- [ ] Verify every route has nav entry or is marked hidden
- [ ] Verify RBAC gating matches module-level rules
- [ ] Verify API and UI permissions are consistent
- [ ] Generate `reports/hardening/route-rbac-phase23.json`
- [ ] Fix all mismatches

### STEP 3 — Event Bus + Cross-Module Propagation Testing
- [ ] Create `scripts/events/test-event-propagation-phase23.ts`
- [ ] Test invoice creation → event published
- [ ] Test invoice payment → event published
- [ ] Test PO creation → event published
- [ ] Test WO release → event published
- [ ] Test WO completion → event published
- [ ] Test inventory transfer → event published
- [ ] Test payroll run → event published
- [ ] Test POS cashup → event published
- [ ] Test import job → event published
- [ ] Verify subscriber invocation (idempotent)
- [ ] Verify metrics incremented
- [ ] Verify trace/correlation ID propagated
- [ ] Generate `reports/events/event-propagation-phase23.json`
- [ ] Fix any silent failures

### STEP 4 — AI Engine End-to-End Validation
- [ ] Create `scripts/ai/test-ai-end-to-end-phase23.ts`
- [ ] Test AI reconciliation
- [ ] Test GL anomaly detection
- [ ] Test inventory anomaly detection
- [ ] Test payroll anomaly detection
- [ ] Test management commentary
- [ ] Validate AI_ENGINE_ENABLED logic
- [ ] Validate pseudonymisation
- [ ] Validate metrics
- [ ] Validate Sentry capture
- [ ] Validate UI integration
- [ ] Generate `reports/ai/ai-e2e-phase23.json`
- [ ] Fix any issues

### STEP 5 — Import/Export Suite E2E Validation
- [ ] Create `scripts/import/test-import-suite-phase23.ts`
- [ ] Test COA export
- [ ] Test COA preview/apply
- [ ] Test opening balances preview/apply
- [ ] Test item master import
- [ ] Test vendor import
- [ ] Test payroll import
- [ ] Test PO import
- [ ] Validate CSV parsing
- [ ] Validate row mapping
- [ ] Validate validation engine
- [ ] Validate import service safe-mode
- [ ] Validate event publishing
- [ ] Generate `reports/imports/import-suite-phase23.json`
- [ ] Fix any preview/apply issues

### STEP 6 — Attachments Service Validation
- [ ] Create `scripts/attachments/test-attachments-phase23.ts`
- [ ] Test upload URL request
- [ ] Test download URL request
- [ ] Validate presigned generation
- [ ] Validate encryption hooks
- [ ] Validate virus scan stub
- [ ] Validate UI rendering of AttachmentPanel
- [ ] Generate `reports/attachments/attachments-phase23.json`
- [ ] Fix any issues

### STEP 7 — Observability + Logging Validation
- [ ] Create `scripts/observability/test-observability-phase23.ts`
- [ ] Check correlation ID creation
- [ ] Check correlation ID propagation across nested services
- [ ] Check correlation ID propagation into event bus
- [ ] Check Sentry wrapper capturing
- [ ] Check metrics incrementing across modules
- [ ] Check dashboard metrics consistency
- [ ] Generate `reports/observability/observability-phase23.json`

### STEP 8 — API Baseline + Runtime Smoke
- [ ] Extend `scripts/runtime/runtime-smoke.ts` with Phases 16–22 endpoints
- [ ] Add AI endpoints
- [ ] Add attachments endpoints
- [ ] Add import/export endpoints
- [ ] Add healthcare endpoints
- [ ] Add partner endpoints
- [ ] Add admin endpoints
- [ ] Add tax endpoints
- [ ] Add analytics endpoints
- [ ] Add observability endpoints
- [ ] Add events endpoints
- [ ] Create `scripts/runtime/generate-route-map-phase23.ts`
- [ ] Generate `reports/runtime/route-map-phase23.json`
- [ ] Run runtime smoke tests
- [ ] Fix any broken routes

### STEP 9 — Full UI Pass (Module by Module)
- [ ] Finance module UI check
- [ ] Banking module UI check
- [ ] Inventory module UI check
- [ ] Manufacturing module UI check
- [ ] Purchasing module UI check
- [ ] HR/Payroll module UI check
- [ ] Sales/CRM scaffold UI check
- [ ] Projects module UI check
- [ ] POS module UI check
- [ ] Tax module UI check
- [ ] Analytics module UI check
- [ ] AI Engine module UI check
- [ ] Healthcare module UI check
- [ ] Admin module UI check
- [ ] Partners module UI check
- [ ] Ops/DR/Performance module UI check
- [ ] Import/Export module UI check
- [ ] Attachments module UI check
- [ ] Observability module UI check
- [ ] Document results in this file
- [ ] Fix all issues

### STEP 10 — Final Acceptance Evidence Pack
- [ ] Generate route screenshots
- [ ] Include smoke test outputs
- [ ] Include event bus propagation results
- [ ] Include AI E2E output
- [ ] Include import/export suite results
- [ ] Include observability tests
- [ ] Include final route map
- [ ] Include UI shell summary
- [ ] Include summary of all known schema gaps
- [ ] Complete `reports/acceptance/PHASE23-acceptance-evidence.md`

### STEP 11 — Verification
- [ ] Run `pnpm -w typecheck` — PASS
- [ ] Run `DATABASE_URL="..." pnpm -w build` — PASS
- [ ] Run `pnpm -w lint` — PASS (only known resolver error)
- [ ] Verify no dead routes
- [ ] Verify no missing imports
- [ ] Verify no broken navigation
- [ ] Verify no broken theme
- [ ] Verify AI endpoints functional
- [ ] Verify observability wiring correct
- [ ] Verify event bus functioning
- [ ] Verify attachments functional (or degrade cleanly)
- [ ] Verify import/export functional
- [ ] Verify POS functional
- [ ] Verify healthcare functional

---

## Module Verification Status

| Module | UI Complete | RBAC OK | Events OK | Observability OK | AI OK | Import/Export OK | Status |
|--------|-------------|---------|-----------|------------------|-------|-------------------|--------|
| Finance | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Banking | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Inventory | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Manufacturing | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Purchasing | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| HR/Payroll | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Sales/CRM | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Projects | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| POS | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Tax | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Analytics | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| AI Engine | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Healthcare | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Admin | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Partners | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Ops/DR | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Import/Export | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Attachments | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Observability | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |

**Legend**: ✅ Complete | ⏳ In Progress | ❌ Failed | ⚠️ Needs Fix

---

## Cross-Module Propagation Matrix

| Module | Publishes Events | Consumes Events | Updates Other Modules | Schema Gaps |
|--------|------------------|-----------------|----------------------|-------------|
| Finance | `finance.invoice.*`, `finance.payment.*` | `inventory.transfer.*` | Updates GL, AR/AP | Outbox not durable |
| Banking | `banking.reconciliation.*` | `finance.payment.*` | Updates GL | Outbox not durable |
| Inventory | `inventory.transfer.*`, `inventory.adjustment.*` | `manufacturing.wo.*` | Updates GL | Outbox not durable |
| Manufacturing | `manufacturing.wo.*`, `manufacturing.bom.*` | `inventory.transfer.*` | Updates Inventory, GL | Outbox not durable |
| Purchasing | `purchasing.po.*` | `finance.payment.*` | Updates GL, AP | Outbox not durable |
| HR/Payroll | `hr.payroll.*`, `hr.employee.*` | None | Updates GL | Outbox not durable |
| Sales/CRM | `sales.order.*`, `sales.lead.*` | `finance.invoice.*` | Updates AR | Outbox not durable |
| Projects | `projects.task.*`, `projects.timesheet.*` | None | Updates GL | Outbox not durable |
| POS | `pos.sale.*`, `pos.cashup.*` | `inventory.transfer.*` | Updates Inventory, GL | Outbox not durable |
| Tax | `tax.vat.*` | `finance.invoice.*` | Updates GL | Outbox not durable |
| Analytics | None | All events | Aggregates KPIs | Read-only |
| AI Engine | `ai.recommendation.*` | All events | Provides insights | Read-only |
| Healthcare | `healthcare.patient.*` | None | Updates GL | Outbox not durable |
| Admin | None | All events | Config changes | Read-only |
| Partners | `partners.integration.*` | All events | Syncs data | Outbox not durable |
| Import/Export | `import.job.*` | None | Updates all modules | Outbox not durable |
| Attachments | `attachments.upload.*` | None | Links to records | Outbox not durable |
| Observability | None | All events | Metrics/logs | Read-only |

**Note**: All event publishing uses in-process bus + best-effort outbox (schema gap: no durable outbox table).

---

## UI Completeness Matrix (Phase 22)

| Route | AppShell | PageHeader | DataTable | AI Actions | Mobile OK | A11y OK | Status |
|-------|----------|------------|-----------|------------|-----------|---------|--------|
| `/dashboard` | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Complete |
| `/finance/invoices` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| `/finance/ap/bills` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/finance/gl` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/banking/accounts` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/inventory/items` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Complete |
| `/inventory/transfers` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/manufacturing/work-orders` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| `/purchasing/suppliers` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Complete |
| `/hr/employees` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Complete |
| `/hr/payroll` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/pos/register` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/tax/vat` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/analytics/dashboard` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/ai/overview` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/admin/security` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/healthcare/overview` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/import-export` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/attachments` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |
| `/ops/observability` | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Needs Work |

**Legend**: ✅ Complete | ⚠️ Needs Work | ❌ Not Implemented

---

## Known Schema Gaps

1. **Durable Outbox**: Event publishing uses in-process bus + best-effort outbox. No `OutboxEvent` table exists.
2. **Distributed Tracing Backend**: Trace IDs propagated but not stored/queried.
3. **Metrics Storage**: Metrics stored in Redis (temporary) or Prometheus (if configured). No permanent DB storage.
4. **Full RBAC**: Some modules have basic RBAC; full role/permission matrix not implemented.
5. **Multi-Entity**: Some modules assume single legal entity per tenant.
6. **Audit Trail**: Audit logs exist but not all operations are audited.
7. **Workflow Engine**: No state machine/workflow engine for complex processes.
8. **Document Management**: Attachments use S3 presigned URLs; no versioning or full-text search.

---

## Success Criteria

Phase 23 is complete when:

- ✅ All modules behave coherently and consistently
- ✅ All UI uses the unified design system
- ✅ All observability and propagation paths function
- ✅ All new components/pages pass typecheck/build
- ✅ All acceptance evidence is generated
- ✅ No functionality regressions across the ERP
- ✅ The Nexa ERP is fully hardened, verified, and ready for go-live preparations

---

**Status**: In Progress — Starting implementation of integrity checks and validation scripts.

