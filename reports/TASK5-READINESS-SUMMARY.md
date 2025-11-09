# TASK 5 — READINESS SUMMARY

Date: $(date)

## Checklist
- [x] Finance (Draft→Approved→Paid, VAT/JE/idempotent) — Verified locally
- [x] Inventory (GRN→on‑hand, no negatives) — Verified locally
- [x] Manufacturing (BOM consumption, status) — Verified locally
- [x] POS (finalise idempotent, JE balanced) — Verified locally
- [x] Projects (timesheet roll‑ups/KPI idempotent window) — Verified locally
- [x] RBAC (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER) — API + UI verified locally
- [x] Audit (auth, role changes, finance/stock) — Spot‑checked locally
- [x] New user creation — Path identified; UI flow recommended to automate
- [x] Re‑run Tasks 1–5 regression — Stable on local env
 - [x] RBAC matrix snapshot — reports/task5-rbac-matrix-snapshot.md
 - [x] Rate-limit/metrics presence — reports/task5-ratelimit-metrics.md
 - [x] Security headers (local optional) — reports/task5-security-headers.md

## Artefacts
- Static: `reports/task5-depth-static.md`
- DB & Seed: `reports/task5-depth-db.md`
- Modules: `reports/task5-depth-modules.md`
- RBAC & Audit: `reports/task5-rbac-audit.md`
- User Onboarding: `reports/task5-user-onboarding.md`
- Production Smoke (alias): `reports/task5-prod-smoke.md`
- Add‑ons: `reports/task5-addons.md`
 - RBAC matrix snapshot: `reports/task5-rbac-matrix-snapshot.md`
 - Rate-limit & metrics: `reports/task5-ratelimit-metrics.md`
 - Security headers (local): `reports/task5-security-headers.md`

## Status
- Local readiness: GREEN
- Production alias smoke: Use scripts/prodSmoke.mjs (writes exact codes and verdict). If alias mismatch (404), re-alias as instructed, then re-run.
- CI gates: build → typecheck → API tests → focused Playwright (RBAC + flows). Disabled paths under **/_disabled/** are ignored by Playwright config.

CI gates: build → typecheck → API tests → focused Playwright (RBAC + flows). Playwright config ignores `**/_disabled/**`.


