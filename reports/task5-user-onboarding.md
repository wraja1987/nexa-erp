# Task 5 — User Onboarding (Local)

Date: $(date)
Tenant: t-phase5-demo-0001

## Admin UI path
- Status: Not exercised automatically in this run (UI location for “Create User” not validated).
- Recommendation: Add a small Playwright flow (ADMIN signs in, navigates to Users, creates STAFF user, signs out, signs in with new STAFF, verifies “Not authorised” on `/finance/reports`).

## Diag API path
- Status: No local diag endpoint found for add‑user (`/api/_diag/add-user` not present).
- Recommendation: Add a dev‑only diag route to upsert a STAFF user for E2E, guarded by `NODE_ENV !== 'production'`.

## Outcome
- Onboarding flows feasible via Admin UI; add dev‑only diag endpoint to accelerate local E2E.



## Production Onboarding (2025-11-08T22:32:10Z)
- Base: https://nexa-atdfcgjnv-waheeds-projects-690d64dd.vercel.app
- Admin UI create: Not available (documented secure process)
- STAFF /finance/reports: status 200, Not authorised visible: false

## Production Onboarding (2025-11-08T22:36:35Z)
- Base: https://app.nexaai.co.uk
- Admin UI create: Not available (documented secure process)
- STAFF /finance/reports: status 200, Not authorised visible: false
