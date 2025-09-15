#!/usr/bin/env bash
set -euo pipefail
ts="$(date +%Y%m%d%H%M%S)"
REPORT_DIR="reports"
mkdir -p "$REPORT_DIR"

scripts/ci/print_header.sh "Install (safe)"
pnpm install --frozen-lockfile || true

scripts/ci/print_header.sh "Gates: all"
set +e
pnpm -w gates:all | tee "$REPORT_DIR/full-audit-$ts.log"
gates=$?
set -e

scripts/ci/print_header.sh "Smoke: all"
set +e
pnpm -w smoke:all | tee "$REPORT_DIR/smoke-all-$ts.log"
smoke=$?
set -e

if [ "$gates" -eq 0 ] && [ "$smoke" -eq 0 ]; then
  exit 0
else
  echo "One or more checks failed (gates=$gates smoke=$smoke)"
  exit 1
fi
