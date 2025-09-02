# Runbooks

- Rotate keys: update `.env.local`, restart services, verify health.
- Stripe webhook: add endpoint in Stripe dashboard, copy `STRIPE_WEBHOOK_SECRET`, set in env, test `/api/stripe/webhook`.
- Backups/DR: `pnpm -w backup:run` to dump; `pnpm -w dr:drill` to restore to temp DB and smoke.
- Jobs: `pnpm -w jobs:run:once` to run demo jobs; check `reports/jobs-status.json`.
