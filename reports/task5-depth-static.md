# Task 5 — Depth (Static & Fast Feedback)

Date: $(date)

## Workspace
- Node: v20 (nvm) — PASS
- pnpm: 10.3.0 — PASS
- Lint: PASS (`pnpm -w lint`)
- Typecheck: PASS (`pnpm -w typecheck`)

## Security & Config
- Active middleware headers (`apps/web/middleware.ts`):
  - Strict-Transport-Security, Referrer-Policy, X-Content-Type-Options, Permissions-Policy — present
  - Auth redirects preserved; public paths include auth and diag endpoints
  - No CSP relaxed here (CSP may be applied at proxy/marketing; see website `.htaccess`)
- Additional security helpers exist but are not the active app middleware:
  - `apps/web/src/middleware.ts` includes a CSP with `'unsafe-inline'` (appears non-active)
  - `apps/web/src/lib/security/headers.ts` defines CSP helpers (not applied globally)
- Conclusion: No weakening detected in active app middleware. Keep CSP management centralized and enforced at edge/reverse-proxy or add a strict CSP header in the active middleware if/when safe.

## x-role override (production behavior)
- Guard: `apps/web/src/lib/auth/guards.server.ts`
  - Honors `x-role` only when `NODE_ENV !== 'production'` (lines 9–13)
  - Production requires real session; override ignored — PASS

## Rate limiting (mutating routes)
- Per-tenant/user limiter: `apps/web/src/lib/rate-limit/tenant.ts` used in:
  - `apps/web/app/api/admin/users/role/route.ts` (role change)
  - `apps/web/app/api/manufacturing/workorder/consume-bom/route.ts` (BOM consumption)
- Global API middleware limiter present in `apps/web/src/middleware.ts` (non-active variant)
- Conclusion: Tenant-aware rate limits applied on key mutating endpoints — PASS

## RBAC matrix and assertions
- Matrix: `apps/web/src/lib/rbac/matrix.ts` (SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER)
- SoD rules in `apps/web/app/api/admin/users/role/route.ts`:
  - Only SUPER_ADMIN can set SUPER_ADMIN
  - ADMIN cannot change own role
- UI permission example: `ui:finance_reports:view` requires ADMIN or SUPER_ADMIN
- Doc: `apps/web/RBAC_MATRIX.md` aligns with code — PASS

## Summary
- Static checks green. No evidence of weakened CSP/HSTS/rate limiting in active code paths.
- Production ignores `x-role` override as required.
- RBAC matrix and SoD enforced where expected.


