# Nexa ERP — Official Starting Point

**Date**: 2025-11-16  
**Status**: Task 8 (Phases 12-20) Complete  
**Build Status**: ✅ Typecheck PASS | ✅ Build PASS (391 routes) | ⚠️ Lint (known non-blocking issue)

---

## Project Overview

**Stack**: Next.js App Router + TypeScript + PNPM 10 + Node 20 + Prisma (Neon/Postgres) + Vercel  
**Root**: `apps/web`  
**Production URL**: https://app.nexaai.co.uk  
**Auth**: next-auth (credentials + Google + Microsoft + OTP)  
**UI**: Approved Nexa ERP layout (sidebar, header/breadcrumbs, KPI band, AI Engine bar at bottom)

---

## Completed Phases

### Phase 12 — AI Engine
- AI task execution framework
- AI client integration
- AI audit logging

### Phase 13 — Admin + Config + Partner
- Admin configuration interfaces
- Partner management

### Phase 14 — Healthcare / PCN / GP
- Healthcare module implementation
- PCN/GP integration

### Phase 15 — Ops + DR + Performance
- Operations tooling
- Disaster recovery procedures
- Performance optimizations

### Phase 16 — Document / Attachment Service
- Attachment service scaffolding
- Schema-safe attachment operations
- Returns `supported:false` when Attachment model missing

### Phase 17 — Import / Export Suite
- Master data imports (vendors, items)
- Import job tracking
- Export functionality

### Phase 18 — Event Bus + Outbox ✅
**Status**: Complete with schema gaps (returns `supported:false`)

**Key Files**:
- `apps/web/src/server/events/types.ts` — Strongly typed event definitions
- `apps/web/src/server/events/bus.ts` — In-process event bus with handler registry
- `apps/web/src/server/events/publisher.ts` — Event publishing with outbox support
- `apps/web/src/server/events/outboxRepository.ts` — Outbox adapter (returns `supported:false`)
- `apps/web/src/server/events/subscribers/index.ts` — Cross-module event handlers
- `apps/web/src/server/events/metrics.ts` — Event metrics

**Event Types**:
- Finance: `finance.invoice.created`, `finance.invoice.paid`, `finance.payment.applied`
- Inventory: `inventory.transfer.created`, `inventory.stock.adjusted`
- Manufacturing: `manufacturing.workorder.released`, `manufacturing.workorder.completed`
- Purchasing: `purchasing.po.approved`
- HR/Payroll: `hr.payroll.run.committed`
- POS: `pos.cashup.previewed`, `pos.cashup.submitted`
- Tax: `tax.vat.return.drafted`
- Analytics: `analytics.snapshot.generated`
- AI: `ai.task.completed`
- Healthcare: `healthcare.claim.previewed`
- Attachments: `attachments.attachment.created`
- Imports: `imports.job.completed`

**Publishers Wired**:
- `apps/web/src/server/finance/lifecycle.ts`
- `apps/web/src/server/inventory/transfers.ts`
- `apps/web/src/server/manufacturing/workorders.ts`
- `apps/web/src/server/purchasing/po.ts`
- `apps/web/src/server/hr/payroll.ts`
- `apps/web/src/server/pos/cashup.ts`
- `apps/web/src/server/imports/masterData.ts`

**Schema Gap**: No `OutboxEvent` model — outbox operations return `supported:false`

---

### Phase 19 — BYOK + Data Residency ✅
**Status**: Complete with schema gaps (returns `supported:false` / "UNKNOWN")

**Key Files**:
- `apps/web/src/server/security/byokConfig.ts` — BYOK environment configuration
- `apps/web/src/server/security/byokProvider.ts` — Key resolution (returns `supported:false`)
- `apps/web/src/server/security/byokCrypto.ts` — Encryption/decryption wrappers (returns `supported:false`)
- `apps/web/src/server/security/byokHooks.ts` — Field-level encryption hooks (NOOP when unsupported)
- `apps/web/src/server/security/dataResidency.ts` — Residency guards
- `scripts/backup/backup-check-phase19.ts` — Backup compliance check
- `apps/web/app/api/security/byok/status/route.ts` — BYOK status API
- `apps/web/app/api/security/residency/status/route.ts` — Residency status API
- `apps/web/app/(app)/admin/security/page.tsx` — Security admin UI

**Encryption Hooks Added**:
- `apps/web/src/server/hr/employees.ts` — Email encryption
- `apps/web/src/server/attachments/service.ts` — Filename encryption

**Schema Gaps**:
- No `TenantKey` model — BYOK returns `supported:false`
- No `TenantConfig` model — Region detection returns "UNKNOWN"
- No `Tenant.region` field — Region detection returns "UNKNOWN"

---

### Phase 20 — Observability ✅
**Status**: Complete (infrastructure-level backends require separate configuration)

**Key Files**:
- `apps/web/src/server/observability/requestContext.ts` — AsyncLocalStorage-based request context
- `apps/web/src/server/observability/apiWrapper.ts` — API wrapper with correlation IDs, Sentry scope
- `apps/web/src/server/observability/sentry.ts` — Sentry integration with correlation IDs
- `apps/web/src/server/observability/metrics.ts` — Centralized metrics recording
- `apps/web/app/(app)/ops/observability/page.tsx` — Observability admin UI
- `docs/observability/PHASE20-observability.md` — Observability documentation
- `docs/observability/PHASE20-dashboards.md` — Dashboard definitions (Prometheus + Grafana)

**Features**:
- ✅ Correlation IDs — Automatic generation/extraction for all API requests
- ✅ Request Context — AsyncLocalStorage propagation
- ✅ Sentry Coverage — Centralized wrapper for all API routes
- ✅ Metrics Layer — Counters, durations, gauges
- ✅ Distributed Tracing — Trace ID generation and propagation
- ✅ Dashboard Definitions — Pre-built queries for Prometheus + Grafana

**Metrics Wired**:
- Finance: `finance_invoice_created`, `finance_invoice_duration_ms`
- Inventory: `inventory_transfer_created`, `inventory_transfer_duration_ms`
- Events: `events_published_total`, `events_handled_total`, `events_handler_duration_ms`

**Infrastructure Gaps** (Require Separate Configuration):
- Prometheus backend for metrics
- Grafana dashboards deployment
- Jaeger/Zipkin for distributed tracing

---

## Critical Constraints

### Schema Lock
- **`apps/web/prisma/schema.prisma` is READ-ONLY** for Task 8
- No Prisma migrations allowed
- All schema-dependent features return `supported:false` or "UNKNOWN"

### No In-Memory/File Stores
- No JSON/file/in-memory persistence for keys/metrics/traces
- Use existing infrastructure (Redis, Sentry) or no-op when disabled
- Keys must come from KMS/HSM or DB (when TenantKey model exists)

### Additive Only
- All changes must be additive and backwards-compatible
- No breaking changes to existing APIs or services
- Observability/Security code must degrade cleanly when backends unconfigured

### Known Issues
- ESLint resolver issue (non-blocking, unchanged from baseline)

---

## Schema Gaps (Documented, Not Blocking)

### Event Bus (Phase 18)
- ❌ No `OutboxEvent` model — Outbox operations return `supported:false`
- ✅ In-process event bus works fully
- ✅ Event publishing wired into services

### BYOK + Data Residency (Phase 19)
- ❌ No `TenantKey` model — Key resolution returns `supported:false`
- ❌ No `TenantConfig` model — Region detection returns "UNKNOWN"
- ❌ No `Tenant.region` field — Region detection returns "UNKNOWN"
- ✅ Encryption hooks are NOOP (will activate when schema exists)
- ✅ Residency guards work (deny when region unknown)

### Attachments (Phase 16)
- ❌ No `Attachment` model — Attachment service returns `supported:false`
- ✅ Service scaffolding ready for when model exists

---

## Verification Status

### Build Verification
```bash
# Typecheck
pnpm -w typecheck
# ✅ PASS

# Build
DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.local)" pnpm -w build
# ✅ PASS (391 routes generated)

# Lint
pnpm -w lint
# ⚠️ Known non-blocking ESLint resolver issue (unchanged)
```

### Test Status
- Unit tests: ✅ PASS (where implemented)
- Integration tests: ✅ PASS (where implemented)
- E2E tests: ✅ PASS (where implemented)

---

## Key Environment Variables

### Sentry
```bash
export SENTRY_DSN="https://..."
export SENTRY_ENV="production"
export SENTRY_RELEASE="nexa-release-2025-11-16"
export SENTRY_TRACES_SAMPLE_RATE="0.20"
export SENTRY_PROFILES_SAMPLE_RATE="0.05"
```

### Metrics
```bash
export NEXA_METRICS_ENABLED="true"
export NEXA_METRICS_PROVIDER="prometheus"  # or "datadog", "redis", "none"
```

### BYOK
```bash
export NEXA_BYOK_ENABLED="true"
export NEXA_BYOK_PROVIDER="aws-kms"  # or "azure-keyvault", "gcp-kms", "local", "none"
export AWS_KMS_KEY_ID="arn:aws:kms:..."
export AWS_KMS_REGION="eu-west-2"
```

### Backup
```bash
export NEXA_BACKUP_ENCRYPTED="true"
export NEXA_BACKUP_RETENTION_DAYS="30"
```

---

## Next Steps (When Ready)

### Task 2 — Schema Migrations
- Add `TenantKey` model for BYOK
- Add `TenantConfig` model for data residency
- Add `OutboxEvent` model for durable event outbox
- Add `Attachment` model for document service
- Add `Tenant.region` field for region detection

### Infrastructure Setup
- Configure Prometheus for metrics collection
- Deploy Grafana dashboards using `docs/observability/PHASE20-dashboards.md`
- Configure Jaeger/Zipkin for distributed tracing
- Set up KMS (AWS KMS, Azure Key Vault, GCP KMS) for BYOK keys

### Continue Task 8
- Phase 21+ (if any remaining phases)
- Or proceed to Task 9

---

## Important Files Reference

### Event System
- `apps/web/src/server/events/types.ts` — Event type definitions
- `apps/web/src/server/events/bus.ts` — Event bus implementation
- `apps/web/src/server/events/publisher.ts` — Event publishing
- `apps/web/src/server/events/outboxRepository.ts` — Outbox adapter
- `apps/web/src/server/events/subscribers/index.ts` — Event handlers

### Security (BYOK + Residency)
- `apps/web/src/server/security/byokConfig.ts` — BYOK configuration
- `apps/web/src/server/security/byokProvider.ts` — Key resolution
- `apps/web/src/server/security/byokCrypto.ts` — Encryption wrappers
- `apps/web/src/server/security/byokHooks.ts` — Encryption hooks
- `apps/web/src/server/security/dataResidency.ts` — Residency guards

### Observability
- `apps/web/src/server/observability/requestContext.ts` — Request context
- `apps/web/src/server/observability/apiWrapper.ts` — API wrapper
- `apps/web/src/server/observability/sentry.ts` — Sentry integration
- `apps/web/src/server/observability/metrics.ts` — Metrics layer

### Documentation
- `docs/events/PHASE18-event-bus-outbox.md` — Event bus documentation
- `docs/security/PHASE19-byok-data-residency.md` — BYOK/residency documentation
- `docs/observability/PHASE20-observability.md` — Observability documentation
- `docs/observability/PHASE20-dashboards.md` — Dashboard definitions

---

## Architecture Decisions

### Event-Driven Architecture
- In-process event bus for immediate dispatch
- Outbox pattern ready for durable persistence (when schema exists)
- Strongly typed events with TypeScript
- Idempotent handlers

### Security Architecture
- BYOK support with graceful degradation
- Field-level encryption hooks (NOOP when unsupported)
- Data residency guards
- Backup/retention policy documentation

### Observability Architecture
- Correlation IDs for request tracking
- AsyncLocalStorage for request context
- Centralized Sentry integration
- Metrics layer with multiple backend support
- Distributed tracing hooks

---

## Notes

- All Phase 18-20 implementations are **schema-safe** and **backwards-compatible**
- Features return `supported:false` or "UNKNOWN" when schema/infrastructure is missing
- Code is ready to activate when schema migrations are applied
- Infrastructure setup (Prometheus, Grafana, KMS) is separate from code implementation

---

**Last Updated**: 2025-11-16  
**Status**: ✅ Official Starting Point Established


