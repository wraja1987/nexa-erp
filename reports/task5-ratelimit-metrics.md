# Rate-limit & Metrics (Task 5)

Timestamp: $(date -u +'%Y-%m-%d %H:%M:%S UTC')

## Summary
- Tenant-aware limiter present via `apps/web/src/lib/rate-limit/tenant.ts` (keys use `rl:${bucket}:${tenantId}:${userId}:<window>`).
- Mutating routes enforce rate-limit checks (e.g., admin role change, MFG consume BOM, Inventory GRN, POS finalise, Projects roll-up).
- Sentry breadcrumbs with category `erp.logic` added in core routes for traceability.
- Metrics counters (best-effort) incremented via `incMetric(...)` in key flows.

## Notes
- If Redis/Sentry are not configured in production, effects may not be directly observable; instrumentation exists in code and is no-op/fallback otherwise.
- No CSP or auth route changes were made as part of this task.


