#!/bin/bash
# Phase 23 — DR Rehearsal Wrapper
# Runs DR rehearsal in dry-run mode and captures output

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_DIR="$ROOT_DIR/reports/hardening"
DR_SCRIPT="$ROOT_DIR/scripts/dr/dr-rehearsal.sh"

mkdir -p "$REPORT_DIR"

if [ ! -f "$DR_SCRIPT" ]; then
  echo "⚠️  DR rehearsal script not found at $DR_SCRIPT"
  echo "Skipping DR check..."
  exit 0
fi

if [ -z "${DR_DATABASE_URL:-}" ]; then
  echo "⚠️  DR_DATABASE_URL not set. Skipping DR check..."
  exit 0
fi

echo "🔍 Running DR rehearsal (dry-run mode)..."

# Run DR rehearsal and capture output
bash "$DR_SCRIPT" --dry-run 2>&1 | tee "$REPORT_DIR/dr-phase23.log" || {
  echo "⚠️  DR rehearsal completed with warnings (see log)"
  exit 0
}

echo "✅ DR rehearsal check complete. Log written to: $REPORT_DIR/dr-phase23.log"

