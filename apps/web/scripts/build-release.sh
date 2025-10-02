#!/usr/bin/env bash
set -euo pipefail
SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
TS=$(date +%Y%m%d%H%M)
: "${SENTRY_RELEASE:=nexa-$SHA-$TS}"
export SENTRY_RELEASE
echo "SENTRY_RELEASE=$SENTRY_RELEASE"
pnpm exec next build
