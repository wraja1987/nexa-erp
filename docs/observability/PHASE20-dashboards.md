Last updated: 2025-11-16

Purpose
- Define pre-built observability dashboards for Prometheus + Grafana (or equivalent).
- Document metric names and queries for ops teams.

Who should read this
- DevOps engineers configuring Grafana dashboards.
- SRE teams managing production monitoring.
- Developers adding new metrics.

---

## Dashboard Overview

These dashboards assume Prometheus as the metrics backend and Grafana for visualization. Metric names follow the patterns defined in `apps/web/src/server/observability/metrics.ts`.

---

## 1. API Health Dashboard

### Purpose
Monitor API request rates, error rates, and latency across all routes.

### Metrics

**Request Rate**:
```
sum(rate(http_requests_total{job="nexa-api"}[5m])) by (route, method)
```

**Error Rate (5xx)**:
```
sum(rate(http_requests_total{job="nexa-api",status=~"5.."}[5m])) by (route)
/
sum(rate(http_requests_total{job="nexa-api"}[5m])) by (route)
```

**P95 Latency**:
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="nexa-api"}[5m])) by (le, route))
```

**P99 Latency**:
```
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{job="nexa-api"}[5m])) by (le, route))
```

**Error Rate by Module**:
```
sum(rate(http_requests_total{job="nexa-api",status=~"5.."}[5m])) by (module)
/
sum(rate(http_requests_total{job="nexa-api"}[5m])) by (module)
```

### Panels

1. **Request Rate** — Line graph showing requests/sec per route
2. **Error Rate** — Line graph showing 5xx error rate per route
3. **P95/P99 Latency** — Line graph showing latency percentiles
4. **Error Rate by Module** — Bar chart showing error rate per module
5. **Top Error Routes** — Table showing routes with highest error rates

---

## 2. Finance/Banking Dashboard

### Purpose
Monitor finance lifecycle operations and banking reconciliation.

### Metrics

**Invoice Creation Rate**:
```
sum(rate(finance_invoice_created_total{status="ok"}[5m])) by (tenantId)
```

**Invoice Creation Errors**:
```
sum(rate(finance_invoice_created_total{status="error"}[5m])) by (tenantId)
```

**Invoice Creation Duration**:
```
histogram_quantile(0.95, sum(rate(finance_invoice_duration_ms_bucket[5m])) by (le, tenantId))
```

**Payment Applied Rate**:
```
sum(rate(finance_payment_applied_total{status="ok"}[5m])) by (tenantId)
```

**Banking Reconciliation Rate**:
```
sum(rate(banking_reconciliation_run_total{status="ok"}[5m])) by (tenantId)
```

**Banking Reconciliation Duration**:
```
histogram_quantile(0.95, sum(rate(banking_reconciliation_duration_ms_bucket[5m])) by (le, tenantId))
```

### Panels

1. **Invoice Creation Rate** — Line graph
2. **Invoice Creation Errors** — Line graph
3. **Invoice Creation P95 Duration** — Line graph
4. **Payment Applied Rate** — Line graph
5. **Banking Reconciliation Rate** — Line graph
6. **Banking Reconciliation P95 Duration** — Line graph
7. **Finance Error Rate** — Single stat showing overall error rate

---

## 3. Inventory/Manufacturing Dashboard

### Purpose
Monitor inventory transfers and manufacturing work orders.

### Metrics

**Inventory Transfer Rate**:
```
sum(rate(inventory_transfer_created_total{status="ok"}[5m])) by (tenantId)
```

**Inventory Transfer Duration**:
```
histogram_quantile(0.95, sum(rate(inventory_transfer_duration_ms_bucket[5m])) by (le, tenantId))
```

**Work Order Released Rate**:
```
sum(rate(manufacturing_workorder_released_total{status="ok"}[5m])) by (tenantId)
```

**Work Order Completed Rate**:
```
sum(rate(manufacturing_workorder_completed_total{status="ok"}[5m])) by (tenantId)
```

**Work Order Duration**:
```
histogram_quantile(0.95, sum(rate(manufacturing_workorder_duration_ms_bucket[5m])) by (le, tenantId))
```

### Panels

1. **Inventory Transfer Rate** — Line graph
2. **Inventory Transfer P95 Duration** — Line graph
3. **Work Order Released Rate** — Line graph
4. **Work Order Completed Rate** — Line graph
5. **Work Order P95 Duration** — Line graph
6. **Inventory/Manufacturing Error Rate** — Single stat

---

## 4. HR/Payroll Dashboard

### Purpose
Monitor payroll runs and HR operations.

### Metrics

**Payroll Run Committed Rate**:
```
sum(rate(payroll_run_committed_total{status="ok"}[5m])) by (tenantId)
```

**Payroll Run Duration**:
```
histogram_quantile(0.95, sum(rate(payroll_run_duration_ms_bucket[5m])) by (le, tenantId))
```

**Payroll Journal Posted Rate**:
```
sum(rate(payroll_journal_posted_total{status="ok"}[5m])) by (tenantId)
```

### Panels

1. **Payroll Run Committed Rate** — Line graph
2. **Payroll Run P95 Duration** — Line graph
3. **Payroll Journal Posted Rate** — Line graph
4. **Payroll Error Rate** — Single stat

---

## 5. AI & Events Dashboard

### Purpose
Monitor AI task execution and event bus performance.

### Metrics

**AI Task Run Rate**:
```
sum(rate(ai_task_run_total{status="ok"}[5m])) by (task_type, tenantId)
```

**AI Task Duration**:
```
histogram_quantile(0.95, sum(rate(ai_task_duration_ms_bucket[5m])) by (le, task_type, tenantId))
```

**Events Published Rate**:
```
sum(rate(events_published_total{status="ok"}[5m])) by (eventType, tenantId)
```

**Events Handled Rate**:
```
sum(rate(events_handled_total{status="ok"}[5m])) by (eventType, tenantId)
```

**Events Handler Duration**:
```
histogram_quantile(0.95, sum(rate(events_handler_duration_ms_bucket[5m])) by (le, eventType, tenantId))
```

**Event Handler Errors**:
```
sum(rate(events_handled_total{status="error"}[5m])) by (eventType, tenantId)
```

### Panels

1. **AI Task Run Rate** — Line graph by task type
2. **AI Task P95 Duration** — Line graph by task type
3. **Events Published Rate** — Line graph by event type
4. **Events Handled Rate** — Line graph by event type
5. **Events Handler P95 Duration** — Line graph by event type
6. **Event Handler Error Rate** — Line graph by event type
7. **Events Published vs Handled** — Comparison line graph

---

## 6. Imports/ETL Dashboard

### Purpose
Monitor import jobs and ETL snapshot runs.

### Metrics

**Import Job Run Rate**:
```
sum(rate(imports_job_run_total{status="ok"}[5m])) by (import_type, tenantId)
```

**Import Job Duration**:
```
histogram_quantile(0.95, sum(rate(imports_job_duration_ms_bucket[5m])) by (le, import_type, tenantId))
```

**ETL Snapshot Run Rate**:
```
sum(rate(etl_snapshot_run_total{status="ok"}[5m])) by (tenantId)
```

**ETL Snapshot Duration**:
```
histogram_quantile(0.95, sum(rate(etl_snapshot_duration_ms_bucket[5m])) by (le, tenantId))
```

### Panels

1. **Import Job Run Rate** — Line graph by import type
2. **Import Job P95 Duration** — Line graph by import type
3. **ETL Snapshot Run Rate** — Line graph
4. **ETL Snapshot P95 Duration** — Line graph
5. **Import/ETL Error Rate** — Single stat

---

## 7. POS Dashboard

### Purpose
Monitor POS operations.

### Metrics

**Cashup Previewed Rate**:
```
sum(rate(pos_cashup_previewed_total{status="ok"}[5m])) by (tenantId)
```

**Sale Finalised Rate**:
```
sum(rate(pos_sale_finalised_total{status="ok"}[5m])) by (tenantId)
```

### Panels

1. **Cashup Previewed Rate** — Line graph
2. **Sale Finalised Rate** — Line graph
3. **POS Error Rate** — Single stat

---

## 8. Tax Dashboard

### Purpose
Monitor tax operations.

### Metrics

**VAT Return Drafted Rate**:
```
sum(rate(tax_vat_return_drafted_total{status="ok"}[5m])) by (tenantId)
```

**VAT Submission Rate**:
```
sum(rate(tax_vat_submission_total{status="ok"}[5m])) by (tenantId)
```

### Panels

1. **VAT Return Drafted Rate** — Line graph
2. **VAT Submission Rate** — Line graph
3. **Tax Error Rate** — Single stat

---

## 9. Analytics Dashboard

### Purpose
Monitor analytics snapshot generation.

### Metrics

**Analytics Snapshot Generated Rate**:
```
sum(rate(analytics_snapshot_generated_total{status="ok"}[5m])) by (tenantId)
```

**Analytics Snapshot Duration**:
```
histogram_quantile(0.95, sum(rate(analytics_snapshot_duration_ms_bucket[5m])) by (le, tenantId))
```

### Panels

1. **Analytics Snapshot Generated Rate** — Line graph
2. **Analytics Snapshot P95 Duration** — Line graph
3. **Analytics Error Rate** — Single stat

---

## Alerting Rules

### High Error Rate
```
sum(rate(http_requests_total{job="nexa-api",status=~"5.."}[5m])) by (route)
/
sum(rate(http_requests_total{job="nexa-api"}[5m])) by (route)
> 0.05
```
Alert when error rate exceeds 5% for any route.

### High Latency
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="nexa-api"}[5m])) by (le, route)) > 2
```
Alert when P95 latency exceeds 2 seconds.

### Event Handler Failures
```
sum(rate(events_handled_total{status="error"}[5m])) by (eventType) > 10
```
Alert when event handler error rate exceeds 10 errors/min.

### Payroll Run Failures
```
sum(rate(payroll_run_committed_total{status="error"}[5m])) by (tenantId) > 0
```
Alert when any payroll run fails.

---

## Notes

- All metrics use 5-minute windows for rate calculations
- Histogram quantiles use 0.95 (P95) by default; adjust as needed
- Tenant ID is included in all queries for multi-tenant filtering
- Error rates are calculated as `error_count / total_count`
- Duration metrics are in milliseconds

---

## Future Enhancements

### When Prometheus Backend is Configured

- Export metrics in Prometheus format via `/api/metrics` endpoint
- Configure Prometheus to scrape metrics endpoint
- Deploy these dashboards to Grafana

### When Datadog is Configured

- Use Datadog metric names instead of Prometheus
- Use Datadog dashboards instead of Grafana
- Adapt queries to Datadog query language

