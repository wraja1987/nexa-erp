#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
APP="$ROOT/apps/web"
ENV_FILE="${1:-$ROOT/Nexa ERP Backend/deploy/.env}"
[ -f "$ENV_FILE" ] || { echo "[fatal] .env missing at $ENV_FILE"; exit 1; }
export $(grep -E "^[A-Z0-9_]+=" "$ENV_FILE" | xargs)
cd "$ROOT"
corepack enable >/dev/null 2>&1 || true
pnpm -w install
# Generate + migrate
pnpm --filter @nexa/web prisma generate --cwd "$APP"
pnpm --filter @nexa/web prisma migrate deploy --cwd "$APP"
# Optional seed script if present
[ -f "$APP/prisma/seed.ts" ] && pnpm --filter @nexa/web prisma db seed --cwd "$APP" || true
echo "[ok] Prisma migrations deployed."
