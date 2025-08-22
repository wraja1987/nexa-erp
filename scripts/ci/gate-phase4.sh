#!/usr/bin/env bash
set -euo pipefail

pnpm -w gate:phase0
pnpm -w gate:phase1
pnpm -w gate:phase2
pnpm -w gate:phase3

echo "Phase 4 gate OK"
exit 0


