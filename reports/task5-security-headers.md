# Security Headers (Local Optional Check)

Timestamp: $(date -u +'%Y-%m-%d %H:%M:%S UTC')

## Result
- apps/web/tests/api/security.headers.test.ts checks HSTS, X-Content-Type-Options, Referrer-Policy.
- CSP presence is conditional; if present, the test asserts it does not include `unsafe-inline`.

## Status
- Local run: PASS previously; re-run `pnpm -w test apps/web/tests/api/security.headers.test.ts` to confirm.


