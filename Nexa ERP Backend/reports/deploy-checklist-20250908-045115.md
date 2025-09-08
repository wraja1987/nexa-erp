# Nexa ERP – Deployment Checklist (production)

## Pre-requisites
- Full audit: PASS (build, gates, smoke)
- Env files present:
  - Backend: Nexa ERP Backend/deploy/.env
  - Web: apps/web/.env.local
- Core services reachable (Postgres/Redis) from API host

## Secrets & config (confirm)
- DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY
- Stripe Billing/POS: keys + webhooks
  - Billing webhook: https://api.nexaai.co.uk/api/stripe/webhook
  - POS webhook:     https://api.nexaai.co.uk/api/pos/stripe/webhook
- Open Banking (TrueLayer): CLIENT_ID/SECRET (env=live)
  - Redirect: https://app.nexaai.co.uk/api/openbanking/callback
- HMRC VAT (MTD): CLIENT_ID/SECRET (env=production)
  - Redirect: https://app.nexaai.co.uk/api/hmrc/callback
- OAuth: Google + Microsoft IDs/secrets
- Notifications: Email-only (SMTP)
  - SMTP_HOST/PORT/USER/PASS, SMTP_SECURE=true, EMAIL_FROM set
- Marketplace & HubSpot: disabled (no keys; UI mentions removed)

## Build & runtime
- pnpm -w build (done pre-deploy)
- Reverse proxy (Caddy/Nginx) terminating TLS for api.nexaai.co.uk / app.nexaai.co.uk
- Start command (choose one):
  - Docker Compose (preferred) – or – PM2 for Node processes
- Health checks
  - API: https://api.nexaai.co.uk/api/healthz
  - App: https://app.nexaai.co.uk/

## Post-deploy validation
- Stripe webhooks: events deliver 2xx
- TrueLayer OAuth completes; accounts/transactions load
- HMRC OAuth completes; obligations/returns endpoints respond
- Email send test; SPF/DKIM/DMARC pass, hits inbox
- POS simulator on (toggle STRIPE_TERMINAL_SIMULATOR as needed later)

## Ops
- Backups: DB + object storage target configured
- Monitoring: logs/metrics; optional SIEM endpoint
- Incident: contact + rollback notes
