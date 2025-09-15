#!/usr/bin/env bash
set -euo pipefail
if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 not found — installing with Homebrew…"
  brew install k6
fi
echo "Running k6 smoke..."
k6 run ops/load/k6-smoke.js
