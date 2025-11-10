# Redis in Production — Enablement Notes

Current behavior:
- System degrades gracefully with `redis:false` in `/api/healthz` and `/api/readyz`.
- Queues/outbox and some caches are no-ops without Redis.

Enable later (recommended):
1) Provision managed Redis (Upstash, Redis Enterprise, Azure Cache, etc.).
2) Set `REDIS_URL` in Vercel Project (Production, Preview, Dev) as appropriate.
3) Redeploy (prebuilt) — health/ready should flip to `redis:true`.
4) Verify:
   - `/api/healthz` and `/api/readyz` -> 200 with `"redis": true`
   - `/api/metrics` shows queue sizes and failure counters > 0 only when applicable.

Caveats:
- Keep rate-limit and idempotency keys within TTL bounds (document defaults).
- Ensure backups job uses object storage if configured; otherwise continues with local-fallback.


