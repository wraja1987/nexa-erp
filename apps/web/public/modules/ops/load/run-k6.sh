#!/usr/bin/env bash
set -euo pipefail

if ! command -v k6 >/dev/null 2>&1; then
  echo "SKIPPED: k6 not installed. Install: brew install k6 or see https://k6.io/docs/" >&2
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node -v >/dev/null 2>&1 || true

echo "Running k6 smoke..."
k6 run "$SCRIPT_DIR/k6-smoke.js"

