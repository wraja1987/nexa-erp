#!/usr/bin/env bash
set -euo pipefail

TARGET="apps/web/.next/routes-manifest.json"
if [ -f "$TARGET" ]; then
  echo "OK: Found $TARGET"
  exit 0
fi

echo "ERROR: Next.js routes manifest not found at $TARGET" >&2
echo "Hint: Ensure apps/web/package.json has \"build\": \"next build\" and the build ran successfully." >&2
exit 1