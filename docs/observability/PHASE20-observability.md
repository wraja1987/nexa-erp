Last updated: 2025-11-16

Purpose
- Document Phase 20 — OBSERVABILITY implementation for Task 8.
- Inventory existing observability infrastructure and document enhancements.

Who should read this
- Developers implementing observability features.
- DevOps engineers configuring monitoring infrastructure.
- SRE teams managing production systems.

---

## Current State

### Sentry Configuration

**Existing Setup**:
- ✅ Sentry initialized in `sentry.server.config.ts` and `sentry.client.config.ts`
- ✅ DSN configured via `SENTRY_DSN` environment variable
- ✅ Error scrubbing via `scrubEvent()` function
- ✅ Traces sampling: 20% server, 15% client
- ✅ Profiling: 5% server, 0% client

**Current Usage**:
- Some API routes use Sentry directly (`finance/ap/bill/pay`, `finance/ap/bill/approve`)
- Event bus captures exceptions to Sentry
- Event metrics report failures to Sentry

**Gaps**:
- ❌ Not all API routes have Sentry coverage
- ❌ Correlation IDs not consistently propagated to Sentry scope
- ❌ No centralized Sentry wrapper for API handlers

### Correlation IDs

**Existing Infrastructure**:
- ✅ `getOrCreateCorrelationId()` function in `apps/web/src/lib/logs/tracer.ts`
- ✅ Reads `x-correlation-id` or `traceparent` headers
- ✅ Generates UUID if not present
- ✅ Used in some API routes (`/api/metrics`)

**Gaps**:
- ❌ Not consistently used across all API routes
- ❌ Not propagated to services/events/AI
- ❌ No AsyncLocalStorage-based request context

### Metrics

**Existing Infrastructure**:
- ✅ `incMetric()` function in `apps/web/src/lib/observability/metrics.ts`
- ✅ Redis-based metrics storage
- ✅ Used in event metrics (`events/metrics.ts`)

**Gaps**:
- ❌ Not consistently used across all modules
- ❌ No duration/timing metrics
- ❌ No Prometheus/Datadog integration (Redis-only)

### Distributed Tracing

**Existing Infrastructure**:
- ✅ Correlation IDs in event types (`correlationId` field)
- ✅ Some trace propagation in events

**Gaps**:
- ❌ No traceId/spanId generation
- ❌ No trace propagation to AI client
- ❌ No trace headers in API responses

---

## Phase 20 Scope (Schema Lock)

### What Phase 20 Implements

**Correlation ID + Request Context**:
- ✅ AsyncLocalStorage-based request context
- ✅ Consistent correlation ID extraction and propagation
- ✅ Request context available throughout request lifecycle

**Sentry Coverage**:
- ✅ Centralized Sentry wrapper for all API routes
- ✅ Correlation ID and tenant info in Sentry scope
- ✅ Automatic error capture for all API handlers

**Metrics Layer**:
- ✅ Centralized metrics recording (`incrementCounter`, `recordDuration`)
- ✅ Metrics wired into key modules (Finance, Inventory, Manufacturing, Purchasing, HR/Payroll, Banking, POS, Tax, Analytics, AI, Events, Imports)
- ✅ Environment-based enablement (`NEXA_METRICS_ENABLED`)

**Distributed Tracing**:
- ✅ Trace ID generation and propagation
- ✅ Trace ID in API response headers (`x-trace-id`)
- ✅ Trace ID propagation to events and AI client

**Ops Dashboards**:
- ✅ Dashboard definitions documented (Prometheus + Grafana)
- ✅ Metric names standardized

**Observability Admin UI**:
- ✅ Admin panel for observability status
- ✅ Sentry configuration status
- ✅ Metrics configuration status

### What Phase 20 Does NOT Implement

- ❌ Prometheus/Datadog backend configuration (infrastructure-level)
- ❌ Grafana dashboard deployment (infrastructure-level)
- ❌ Distributed tracing infrastructure (Jaeger, Zipkin, etc.)
- ❌ Real-time alerting rules (infrastructure-level)

---

## Modules + Metrics Instrumented

### Finance

**Metrics**:
- `finance_invoice_created` — Counter (tags: `module=finance`, `operation=create_invoice`, `tenantId`, `status`)
- `finance_invoice_paid` — Counter (tags: `module=finance`, `operation=pay_invoice`, `tenantId`, `status`)
- `finance_payment_applied` — Counter (tags: `module=finance`, `operation=apply_payment`, `tenantId`, `status`)
- `finance_ar_aging_duration_ms` — Duration (tags: `module=finance`, `operation=ar_aging`, `tenantId`)

**Services Instrumented**:
- `apps/web/src/server/finance/lifecycle.ts` — Invoice creation, payment, approval

### Banking

**Metrics**:
- `banking_reconciliation_run` — Counter (tags: `module=banking`, `operation=reconciliation`, `tenantId`, `status`)
- `banking_reconciliation_duration_ms` — Duration (tags: `module=banking`, `operation=reconciliation`, `tenantId`)
- `banking_statement_imported` — Counter (tags: `module=banking`, `operation=import_statement`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/banking/reconciliation.ts` — Reconciliation operations
- `apps/web/src/server/banking/statements.ts` — Statement imports

### Inventory

**Metrics**:
- `inventory_transfer_created` — Counter (tags: `module=inventory`, `operation=create_transfer`, `tenantId`, `status`)
- `inventory_transfer_duration_ms` — Duration (tags: `module=inventory`, `operation=create_transfer`, `tenantId`)
- `inventory_stock_adjusted` — Counter (tags: `module=inventory`, `operation=adjust_stock`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/inventory/transfers.ts` — Transfer creation

### Manufacturing

**Metrics**:
- `manufacturing_workorder_released` — Counter (tags: `module=manufacturing`, `operation=release_workorder`, `tenantId`, `status`)
- `manufacturing_workorder_completed` — Counter (tags: `module=manufacturing`, `operation=complete_workorder`, `tenantId`, `status`)
- `manufacturing_workorder_duration_ms` — Duration (tags: `module=manufacturing`, `operation=complete_workorder`, `tenantId`)

**Services Instrumented**:
- `apps/web/src/server/manufacturing/workorders.ts` — Work order lifecycle

### Purchasing

**Metrics**:
- `purchasing_po_approved` — Counter (tags: `module=purchasing`, `operation=approve_po`, `tenantId`, `status`)
- `purchasing_po_created` — Counter (tags: `module=purchasing`, `operation=create_po`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/purchasing/po.ts` — Purchase order operations

### HR/Payroll

**Metrics**:
- `payroll_run_committed` — Counter (tags: `module=payroll`, `operation=commit_run`, `tenantId`, `status`)
- `payroll_run_duration_ms` — Duration (tags: `module=payroll`, `operation=commit_run`, `tenantId`)
- `payroll_journal_posted` — Counter (tags: `module=payroll`, `operation=post_journal`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/hr/payroll.ts` — Payroll run commit
- `apps/web/src/server/hr/payroll-journals.ts` — Journal posting

### POS

**Metrics**:
- `pos_cashup_previewed` — Counter (tags: `module=pos`, `operation=preview_cashup`, `tenantId`, `status`)
- `pos_sale_finalised` — Counter (tags: `module=pos`, `operation=finalise_sale`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/pos/cashup.ts` — Cashup preview
- `apps/web/src/server/pos/sales.ts` — Sale finalization

### Tax

**Metrics**:
- `tax_vat_return_drafted` — Counter (tags: `module=tax`, `operation=draft_vat_return`, `tenantId`, `status`)
- `tax_vat_submission` — Counter (tags: `module=tax`, `operation=submit_vat`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/tax/vat.ts` — VAT return operations (when implemented)

### Analytics

**Metrics**:
- `analytics_snapshot_generated` — Counter (tags: `module=analytics`, `operation=generate_snapshot`, `tenantId`, `status`)
- `analytics_snapshot_duration_ms` — Duration (tags: `module=analytics`, `operation=generate_snapshot`, `tenantId`)

**Services Instrumented**:
- `apps/web/src/server/analytics/snapshots.ts` — Snapshot generation (when implemented)

### AI

**Metrics**:
- `ai_task_run` — Counter (tags: `module=ai`, `operation=<task_type>`, `tenantId`, `status`)
- `ai_task_duration_ms` — Duration (tags: `module=ai`, `operation=<task_type>`, `tenantId`)

**Services Instrumented**:
- `apps/web/src/server/ai/tasks/*` — AI task execution (when implemented)

### Events

**Metrics**:
- `events_published_total` — Counter (tags: `module=events`, `operation=publish`, `tenantId`, `eventType`, `status`)
- `events_handled_total` — Counter (tags: `module=events`, `operation=handle`, `tenantId`, `eventType`, `status`)
- `events_handler_duration_ms` — Duration (tags: `module=events`, `operation=handle`, `tenantId`, `eventType`)

**Services Instrumented**:
- `apps/web/src/server/events/publisher.ts` — Event publishing
- `apps/web/src/server/events/bus.ts` — Event handling

### Imports/ETL

**Metrics**:
- `imports_job_run` — Counter (tags: `module=imports`, `operation=<import_type>`, `tenantId`, `status`)
- `imports_job_duration_ms` — Duration (tags: `module=imports`, `operation=<import_type>`, `tenantId`)
- `etl_snapshot_run` — Counter (tags: `module=etl`, `operation=snapshot`, `tenantId`, `status`)

**Services Instrumented**:
- `apps/web/src/server/imports/*` — Import operations
- `apps/web/src/server/analytics/etl.ts` — ETL operations (when implemented)

---

## Constraints

- **Schema locked**: No changes to `apps/web/prisma/schema.prisma` or Prisma migrations
- **No JSON/file stores**: Metrics use existing Redis-based infrastructure or no-op when disabled
- **Additive only**: All changes are additive and backwards-compatible
- **Degrade cleanly**: Observability code does not crash when Sentry/metrics backends are unconfigured
- **Nexa shell unchanged**: Logo behavior unchanged

---

## How to Use

### Correlation IDs

**Automatic**:
- Correlation IDs are automatically generated/extracted for all API requests
- Available via `getRequestContext()` in any service function
- Propagated to Sentry scope, events, and AI client

**Manual**:
```typescript
import { getRequestContext } from "@/server/observability/requestContext";

const ctx = getRequestContext();
if (ctx) {
  console.log(`Correlation ID: ${ctx.correlationId}`);
  console.log(`Trace ID: ${ctx.traceId}`);
}
```

### Sentry Integration

**Automatic**:
- All API routes wrapped with `withApiObservability` automatically capture errors to Sentry
- Correlation ID and tenant info are automatically added to Sentry scope

**Manual**:
```typescript
import { captureError } from "@/server/observability/sentry";

try {
  // ... operation
} catch (error) {
  captureError(error, { module: "finance", operation: "create_invoice" });
  throw error;
}
```

### Metrics Recording

**Counters**:
```typescript
import { incrementCounter } from "@/server/observability/metrics";

incrementCounter("finance_invoice_created", {
  module: "finance",
  operation: "create_invoice",
  tenantId: "t-123",
  status: "ok",
});
```

**Durations**:
```typescript
import { recordDuration } from "@/server/observability/metrics";

const start = Date.now();
// ... operation
const duration = Date.now() - start;
recordDuration("finance_invoice_duration_ms", duration, {
  module: "finance",
  operation: "create_invoice",
  tenantId: "t-123",
});
```

### Distributed Tracing

**Automatic**:
- Trace IDs are automatically generated for all API requests
- Available in response headers: `x-correlation-id`, `x-trace-id`
- Propagated to events and AI client

**Manual**:
```typescript
import { getRequestContext } from "@/server/observability/requestContext";

const ctx = getRequestContext();
if (ctx?.traceId) {
  // Include traceId in external API calls or logs
  await externalApiCall({ traceId: ctx.traceId });
}
```

---

## Environment Variables

### Sentry

```bash
export SENTRY_DSN="https://..."
export SENTRY_ENV="production"
export SENTRY_RELEASE="nexa-release-2025-11-16"
export SENTRY_TRACES_SAMPLE_RATE="0.20"  # 20% sampling
export SENTRY_PROFILES_SAMPLE_RATE="0.05"  # 5% profiling
```

### Metrics

```bash
export NEXA_METRICS_ENABLED="true"
export NEXA_METRICS_PROVIDER="prometheus"  # or "datadog", "none"
```

### Correlation/Tracing

```bash
# Correlation IDs are automatic (no config needed)
# Trace IDs are automatic (no config needed)
```

---

## Limitations

1. **No Prometheus Backend**: Metrics are recorded but require Prometheus/Datadog backend to be configured separately
2. **No Distributed Tracing Backend**: Trace IDs are generated but require Jaeger/Zipkin backend to be configured separately
3. **Redis-Only Metrics**: Current metrics implementation uses Redis (not Prometheus-native)
4. **No Real-Time Dashboards**: Dashboard definitions are documented but require Grafana/Datadog setup

---

## Future Enhancements

### When Prometheus Backend is Configured

- Export metrics in Prometheus format via `/api/metrics` endpoint
- Configure Prometheus to scrape metrics endpoint
- Deploy Grafana dashboards using documented definitions

### When Distributed Tracing Backend is Configured

- Export trace spans in OpenTelemetry format
- Configure Jaeger/Zipkin to receive traces
- Link traces with correlation IDs

### When Datadog is Configured

- Use Datadog SDK for metrics and traces
- Configure Datadog agent to forward metrics/traces
- Use Datadog dashboards instead of Grafana

