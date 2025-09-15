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

