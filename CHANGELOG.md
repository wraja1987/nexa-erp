# Changelog

## [20250901000755] Phase 6
- Preflight confirmed green (module shells + seeds + tests)

## [20251104231500] Task 3 (Web)
- Route manifest added and verified against served routes
- Route checker CLI wired (on‑disk + HTTP HEAD/GET)
- Global AI Engine bar via `(app)/layout.tsx`
- Playwright AI bar snapshots across main modules
- Axe a11y sweep for header/sidebar/AI bar (critical-only gate)
- CI workflow runs route check, generates storageState, runs e2e and a11y
- StorageState generator script for NextAuth credentials

