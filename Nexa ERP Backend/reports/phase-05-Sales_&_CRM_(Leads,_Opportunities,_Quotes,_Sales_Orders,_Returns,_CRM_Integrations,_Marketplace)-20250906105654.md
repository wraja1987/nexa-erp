# Nexa ERP — Phase 05: Sales & CRM (Leads, Opportunities, Quotes, Sales Orders, Returns, CRM Integrations, Marketplace) — Audit Summary
- Time: 2025-09-06 10:57:31 BST
- Root: /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/Nexa ERP Backend

## Tail of results
> node scripts/gates/phase3.cjs

PASS: BOM versioning
PASS: BOM multi-level
PASS: MRP planned orders
PASS: WO backflush
PASS: Lot genealogy
PASS: Quality hold + CAPA
PASS: Supplier scoring
PASS: Field service checklist/SLA/sign-off
PASS: Treasury
PASS: Analytics NLQ/scheduler/OData
PASS: Marketplace core
Phase 4 gate OK

> gate:phase5
> node scripts/gates/phase5.cjs

PASS: web route present: apps/web/src/app/(app)/dashboard/page.tsx
PASS: web route present: apps/web/src/app/(app)/help/page.tsx
PASS: web route present: apps/web/src/app/(app)/enterprise/consolidation/page.tsx
PASS: web route present: apps/web/src/app/(app)/enterprise/intercompany/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/manufacturing/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/construction/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/logistics/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/retail/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/saas-tech/page.tsx
PASS: web route present: apps/web/src/app/(app)/industry/professional-services/page.tsx
PASS: web route present: apps/web/src/app/(app)/ai/workflows/page.tsx
PASS: web route present: apps/web/src/app/(app)/ai/runs/page.tsx
PASS: web route present: apps/web/src/app/(app)/ai/audit-logs/page.tsx
PASS: mobile parity test present: apps/mobile/__tests__/parity.test.tsx
PASS: script present: ui:nav:lint
PASS: script present: ui:a11y
PASS: script present: ui:a11y:dark
PASS: script present: ui:perf
PASS: script present: ui:visual
PASS: script present: test:security
PASS: script present: gate:phase5
PASS: CI watches phase-5/**
PASS: script present: openapi:generate
PASS: script present: sdk:build
PASS: script present: golden:all
Phase 5 gate: OK
[step] build

> nexa-erp@ build /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP
> pnpm -r run build

Scope: 7 of 8 workspace projects
apps/web build$ next build
packages/jobs build$ tsc -p tsconfig.json
packages/registry build$ tsc -p tsconfig.json
apps/website-static build$ next build
apps/website-static build:   ▲ Next.js 14.2.5
apps/website-static build:    Creating an optimized production build ...
packages/registry build: Done
packages/sdk-nexa build$ tsc -p tsconfig.json
apps/web build:    ▲ Next.js 15.4.6
apps/web build:    - Environments: .env.local
apps/web build:    Creating an optimized production build ...
packages/jobs build: Done
packages/sdk-nexa build: Done
apps/website-static build:  ✓ Compiled successfully
apps/website-static build:    Linting and checking validity of types ...
apps/website-static build:    Collecting page data ...
apps/website-static build:    Generating static pages (0/33) ...
apps/website-static build:    Generating static pages (8/33) 
apps/website-static build:    Generating static pages (16/33) 
apps/website-static build:    Generating static pages (24/33) 
apps/website-static build:  ✓ Generating static pages (33/33)
apps/website-static build:    Finalizing page optimization ...
apps/website-static build:    Collecting build traces ...
apps/website-static build: Route (app)                              Size     First Load JS
apps/website-static build: ┌ ○ /                                    1.38 kB        88.5 kB
apps/website-static build: ├ ○ /_not-found                          871 B            88 kB
apps/website-static build: ├ ○ /about                               198 B          87.4 kB
apps/website-static build: ├ ○ /compliance/accessibility            198 B          87.4 kB
apps/website-static build: ├ ○ /compliance/cookies                  198 B          87.4 kB
apps/website-static build: ├ ○ /compliance/privacy                  198 B          87.4 kB
apps/website-static build: ├ ○ /compliance/security                 198 B          87.4 kB
apps/website-static build: ├ ○ /contact                             199 B          87.4 kB
apps/website-static build: ├ ○ /docs                                198 B          87.4 kB
apps/website-static build: ├ ○ /docs/finance                        198 B          87.4 kB
apps/website-static build: ├ ○ /docs/getting-started                198 B          87.4 kB
apps/website-static build: ├ ○ /docs/manufacturing                  198 B          87.4 kB
apps/website-static build: ├ ○ /docs/pos                            198 B          87.4 kB
apps/website-static build: ├ ○ /docs/projects                       198 B          87.4 kB
apps/website-static build: ├ ○ /docs/purchasing                     198 B          87.4 kB
apps/website-static build: ├ ○ /docs/sales-crm                      198 B          87.4 kB
apps/website-static build: ├ ○ /docs/wms                            198 B          87.4 kB
apps/website-static build: ├ ○ /features                            240 B          87.4 kB
apps/website-static build: ├ ○ /industries                          198 B          87.4 kB
apps/website-static build: ├ ○ /integrations                        198 B          87.4 kB
apps/website-static build: ├ ○ /legal                               198 B          87.4 kB
apps/website-static build: ├ ○ /partners                            198 B          87.4 kB
apps/website-static build: ├ ○ /pos                                 198 B          87.4 kB
apps/website-static build: ├ ○ /pricing                             199 B          87.4 kB
apps/website-static build: ├ ○ /product                             3.2 kB         90.4 kB
apps/website-static build: ├ ○ /resources                           198 B          87.4 kB
apps/website-static build: ├ ○ /resources/posts                     198 B          87.4 kB
apps/website-static build: ├ ○ /resources/whitepapers               198 B          87.4 kB
apps/website-static build: ├ ○ /security                            199 B          87.4 kB
apps/website-static build: ├ ○ /solutions                           240 B          87.4 kB
apps/website-static build: └ ○ /status                              198 B          87.4 kB
apps/website-static build: + First Load JS shared by all            87.2 kB
apps/website-static build:   ├ chunks/822-fcbe836346d29027.js       31.7 kB
apps/website-static build:   ├ chunks/ecc5d69f-34c804ab0068948e.js  53.6 kB
apps/website-static build:   └ other shared chunks (total)          1.86 kB
apps/website-static build: ○  (Static)  prerendered as static content
apps/website-static build: Done
apps/web build:  ✓ Compiled successfully in 4.0s
apps/web build:    Skipping linting
apps/web build:    Checking validity of types ...
apps/web build:    Collecting page data ...
[step] addons-check

> nexa-erp@ test /Users/waheedraja/Desktop/Business Opportunities/Nexa ERP
> vitest run --reporter=dot -- --run tests/security/sod-matrix.spec.ts


> Full raw log: reports/phase-05-Sales_&_CRM_(Leads,_Opportunities,_Quotes,_Sales_Orders,_Returns,_CRM_Integrations,_Marketplace)-20250906105654.log
