#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
APP="$ROOT/apps/web"
cd "$ROOT"
corepack enable >/dev/null 2>&1 || true
pnpm -w install
pnpm -w build
echo "[ok] Workspace built. Standalone should be under apps/web/.next/standalone"
