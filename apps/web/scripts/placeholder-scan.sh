#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports
PATTERN="TODO|FIXME|PLACEHOLDER|LOREM|Dummy|Example only|TBC|TBD|WIP"
OUT="reports/placeholder-scan-$(date +%F-%H%M).txt"

# Prefer ripgrep if available; otherwise use grep fallback
if command -v rg >/dev/null 2>&1; then
  rg -n --hidden --glob '!public/_modules_misc/**' -e "$PATTERN" > "$OUT" || true
else
  # Exclude heavy preview artifacts using prune
  find . \
    -path "./node_modules" -prune -o \
    -path "./.git" -prune -o \
    -path "./.vercel" -prune -o \
    -path "./public/_modules_misc" -prune -o \
    -type f -print0 | xargs -0 grep -nE "$PATTERN" > "$OUT" || true
fi

wc -l reports/placeholder-scan-*.txt
tail -n +1 reports/placeholder-scan-*.txt | sed -n '1,200p'