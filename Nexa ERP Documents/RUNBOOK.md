# Nexa ERP — RUNBOOK

This runbook provides step-by-step operational procedures for Nexa ERP.

---

## 1. Setup / Bootstrap
### Prerequisites
- Node.js 22.x
- pnpm 10.3.0 (via corepack)
- Docker Desktop (Postgres, Redis)
- Git

### Local setup
```bash
pnpm install
cp .env.example .env
pnpm -w dev
```

ERP app will run on http://localhost:3001

---

## 2. Routine Operations
- Deploy (Vercel): push to main → auto-build.
- Deploy (VPS): build → pm2 restart → Nginx reload.
- Migrations: pnpm -w prisma migrate deploy.
- Restart services: pm2 restart all or docker compose restart.
- Logs: pm2 logs or docker logs <container>.

---

## 3. Monitoring & Alerts
- Sentry: error dashboards for client + server.
- Prometheus: metrics from API, Postgres, Redis.
- Grafana: dashboards for infra, latency, errors, DB.
- Alertmanager: sends alerts → Gmail inbox.

Check dashboards regularly; acknowledge alerts via Alertmanager.

---

## 4. Backups & Disaster Recovery
- Backups: nightly Postgres dumps stored in /reports/.
- Restore:
  1. Spin up fresh DB.
  2. Restore dump with psql.
  3. Run migrations.
- DR drill: restore latest backup, run verification (pnpm -w verify:modules), generate RTO/RPO report.

---

## 5. Incident Response

Common incidents
- /dashboard not loading: check API health + DB.
- /api/modules error: check Postgres + Redis pools.
- Login errors: check NextAuth provider config.

Steps
1. Identify alert (Sentry/Prometheus).
2. Triage: severity, affected tenants.
3. Mitigate: rollback, scale infra, disable flag.
4. Escalate if not recoverable in 30 min.
5. Document in audit log.

---

## 6. Verification Gates

Run before merging or after deploy:

```
pnpm -w verify:modules
pnpm -w verify:ui
pnpm -w test:e2e -- --run
curl -f http://localhost:3001/login
curl -f http://localhost:3001/dashboard
curl -f "http://localhost:3001/api/modules?tree=1"
```

Accessibility smoke:

```
npx playwright test tests/e2e/a11y.smoke.spec.ts
```

Expected: 200 responses, KPIs visible, axe report clean, Lighthouse ≥85/90.

---

## 7. Security & Compliance
- Headers: CSP, Referrer-Policy, X-Frame-Options, cache rules.
- Consent: cookie banner must appear before analytics.
- Vault: BYOK key rotation via CLI, log audit.
- Logs: check reports/audit.jsonl.

---

## 8. Appendix

Common errors
- Error: <Html> should not be imported → check _document.tsx.
- Page not a React Component → clean Next.js page exports.
- DB connection timeout → raise Postgres pool.

Artefact paths
- Backups: /reports/*.sql
- DR reports: /reports/DR-Report-*.md
- Security verification: /reports/Security-Verification-*.md
