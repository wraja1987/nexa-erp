#!/usr/bin/env bash
set -euo pipefail

attempt() {
  echo "---- Attempt $1 ----"
  if scripts/ci/full_check.sh; then
    echo "Checks passed on attempt $1"
    return 0
  fi
  echo "Attempt $1 failed — applying minimal fixes…"

  # Minimal Auto-Fixes (safe)
  if ! grep -q "^\\.expo/" .gitignore 2>/dev/null; then
    echo ".expo/" >> .gitignore
  fi

  pnpm -w lint || true
  pnpm -w typecheck || true

  return 1
}

attempt 1 || attempt 2 || exit 1

# Final pass
scripts/ci/full_check.sh
