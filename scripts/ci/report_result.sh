#!/usr/bin/env bash
set -euo pipefail
file="$1"
if [ -f "$file" ]; then
  if grep -q "^RESULT:" "$file"; then
    grep "^RESULT:" "$file"
    exit 0
  fi
fi
echo "RESULT: FAIL"
exit 1
