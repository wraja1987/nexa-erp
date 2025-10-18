#!/usr/bin/env bash
set -euo pipefail
URL="${DATABASE_URL:-}"
if [[ "$URL" == *"neon.tech"* ]] && [[ "${ALLOW_NEON_DESTRUCTIVE:-0}" != "1" ]]; then
  echo "Refusing destructive Prisma push/reset on Neon (ALLOW_NEON_DESTRUCTIVE!=1)." >&2
  exit 1
fi
