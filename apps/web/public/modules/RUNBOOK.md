## Ops, Performance & Reliability

- Alerting: Prometheus -> Alertmanager -> Gmail (SMTP env vars).
- Uptime monitors: API, Portal, Website (with SSL expiry, content match).
- Load test: `ops/load/run-k6.sh` (p95<900ms, <1% fail).
- Deliverability: `scripts/mailer/smtp-test.ts` then verify SPF/DKIM/DMARC in Gmail.
- Error pages: `apps/web/src/app/404.tsx`, `apps/web/src/app/error.tsx`; reverse proxy `ops/errors/50x.html`.
- CORS/Cache: Static immutable; API no-store; HTML s-maxage=60, SWR=300; Vary: Origin.
- SLOs: `ops/slo.yaml`; burn-rate alerts in `ops/alerts/*`.
- Synthetic: `ops/synthetic/run-synthetic.sh` or CI workflow.
- Chaos drills: `ops/chaos/drill.sh` (dry-run unless `--yes`).
- Dashboards: Grafana on :3002 (if compose), import SLO overview JSON.

Headers audit
-------------
Run: `ops/headers-audit.sh`
Good:
- static: 200 with `Cache-Control: public, max-age=31536000, immutable`
- api: 200 with `Cache-Control: no-store` and correct CORS for allowed origins
- html: 200 with `Cache-Control: s-maxage=60, stale-while-revalidate=300`

Uptime monitors
---------------
- Third-party definitions provided in repo; optional Uptime Kuma compose and seed script.

Test alert
----------
- Use `ops/OPS-RUNBOOK.md` snippet to enable AlwaysFiring for 60s and revert.

Grafana
-------
- Import guide at `ops/dashboards/IMPORT.md`; snapshots saved under `ops/dashboards/snapshots/`.

Headers & CORS (self-healing)
-----------------------------
- Next.js sets cache headers via `next.config.js` and strict API CORS via `middleware.ts`.
- Run verifier: `bash ops/fix-and-verify.sh`.
- To enable proxy path: set `HOST_SSH`/`HOST_WEB_ROOT`/`SUDO_CMD` and re-run the script.
- Passing audit shows 200 for static/api/html and correct Cache-Control/CORS in the table.

