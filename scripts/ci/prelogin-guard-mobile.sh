#!/usr/bin/env bash
set -euo pipefail
pnpm --filter mobile test
echo "Prelogin guard (mobile) passed."

