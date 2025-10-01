# Nexa ERP Web — Data & APIs

Last updated: 2025-09-30

## Quick start

```bash
pnpm install
pnpm api:dev   # starts dev server
pnpm verify:data  # runs verifier script
pnpm test:kpi     # runs Playwright smoke (uses playwright.config.ts)
```

## Environment variables

Do not paste real secrets here.

- DATABASE_URL — Postgres connection string
- REDIS_URL — Redis connection (optional; defaults to redis://127.0.0.1:6379)
- KPI_TTL_SEC — TTL for KPI cache headers (default 120–300)
- KPI_COGS_ENABLED — set "1" to enable GM calculation if COGS available

See `.env.example` for placeholders.

## Modules API

- Source of truth: `public/modules/_tree.json`
- Endpoint: `/api/modules?tree=1` — serves JSON with ETag/304
- Schema docs: `docs/api/modules-tree.md`

## KPIs & Actions

- KPIs: `/api/kpi/revenue`, `/api/kpi/gm`, `/api/kpi/invoices`, `/api/kpi/wip`
- Quick actions: `/api/actions/invoice`, `/api/actions/po`
- Caching: in-process with Redis tag invalidation; TTL via `KPI_TTL_SEC`
- Idempotency: pass `Idempotency-Key` header (60s window)
- Rate limiting: Redis token bucket

## Prisma & DB

- Prisma schema in `prisma/schema.prisma` should match SQL tables:
  - Invoice, InvoiceLine, PurchaseOrder, POLine
- Generate client:

```bash
pnpm db:gen
```

- Migration note: run SQL in `db/migrations/000-bootstrap.sql` on new envs to create extensions and tables.

## CI

Recommended steps in your workflow:

```bash
pnpm verify:data
npx playwright test -c ./playwright.config.ts
```

Fail the build if any step fails.
