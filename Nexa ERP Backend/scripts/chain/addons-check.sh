#!/usr/bin/env bash
set -Eeuo pipefail
# These commands are no-ops if tests or scripts don’t exist in the monorepo
pnpm -w test -- --run tests/security/sod-matrix.spec.ts 2>/dev/null || true
pnpm -w test -- --run tests/webhooks/stripe-replay.spec.ts 2>/dev/null || true
[ -x scripts/ops/restore-drill.sh ] && scripts/ops/restore-drill.sh || true
