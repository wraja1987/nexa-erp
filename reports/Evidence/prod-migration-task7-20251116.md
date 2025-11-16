# Prod migration + deploy — Task 7

## Context

- Project: nexa-erp-reset (Vercel)

- Repo branch: task7-migrate-deploy

- Prod environment: https://app.nexaai.co.uk

## Neon snapshot

- Snapshot name: nexa-prod-pre-task7-migration-20251116-20:05

- Branch: production

- Created via: Neon console (Backup & Restore → production)

## Prisma migrate status

- Prod:

  ```bash

  export DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.local)"

  npx prisma migrate status --schema=apps/web/prisma/schema.prisma

→ Output: database schema is up to date; no pending migrations. Datasource is the Neon production branch (neondb, schema public).

	•	Staging:

export DATABASE_URL="$(sed -n 's/^DATABASE_URL_STAGING=//p' .env.local)"

npx prisma migrate status --schema=apps/web/prisma/schema.prisma

→ Output: database schema is up to date; no pending migrations. Datasource is the Neon staging branch (development, schema public).

Vercel deployment

	•	Project: nexa-erp-reset

	•	Deployment ID: 3w3NBrN23

	•	Source branch: task7-migrate-deploy

	•	Status: Ready / Current (Production)

	•	Domains:

	•	https://app.nexaai.co.uk

	•	nexa-erp-reset-git-task7-migra-451d0f-waheeds-projects-690d64dd.vercel.app

	•	nexa-erp-reset-mtnhatbvi-waheeds-projects-690d64dd.vercel.app

Post-deploy API checks

Unauthenticated curl calls from local terminal:

	•	GET /api/health: HTTP 307 → /login?callbackUrl=/api/health

	•	GET /api/status: HTTP 307 → /login?callbackUrl=/api/status

	•	GET /api/kpi/dashboard: HTTP 307 → /login?callbackUrl=/api/kpi/dashboard

Auth middleware enforces login for these routes; app usage calls them from an authenticated session.

Manual UI checks

	•	Login: https://app.nexaai.co.uk/login

	•	Credentials: super@nexa.ai / ChangeMe!123

	•	Behaviour: redirect to /dashboard, sidebar visible, no redirect loop.

	•	Routes spot-checked (logged in as super admin):

	•	/dashboard

	•	/finance/invoices, /finance/bills, /finance/expenses, /finance/banking, /finance/reconciliation, /finance/reports

	•	/inventory/items, /inventory/warehouses, /inventory/stock-movements

	•	/manufacturing/work-orders, /manufacturing/boms

	•	/sales/leads, /sales/orders

	•	/projects/boards, /projects/time

	•	/hr/employees, /hr/payroll

	•	/pos/register

	•	/ai/workbench

	•	/help

All rendered without 500/404 during this migration check.

Notes

	•	Lint has a known non-blocking issue with eslint-plugin-promise resolution from ../package.json. Typecheck and build both pass and are used as functional gates.

	•	DB schema and prod data are protected by the Neon snapshot listed above.

	•	UI/behavioural improvements (including any future changes to public health/status behaviour) are explicitly deferred to the next task; this document only certifies the migration + deploy.


