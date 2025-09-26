#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v npx >/dev/null 2>&1; then
  echo "FAIL: Node.js/npm required." >&2
  exit 1
fi

# Install browsers if missing (idempotent)
npx playwright install --with-deps >/dev/null 2>&1 || true

echo "Running synthetic checks..."
npx playwright test --config "$HERE/playwright.config.ts"

