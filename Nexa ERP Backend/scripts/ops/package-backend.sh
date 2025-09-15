#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
APP="$ROOT/apps/web"
ART="$ROOT/artifacts"
DEP="$BACKEND/deploy"
TS="$(date +%Y%m%d%H%M%S)"
OUT="$ART/nexa-backend-deploy-${TS}.zip"
mkdir -p "$ART"
# Sanity
[ -d "$APP/.next/standalone" ] || { echo "[fatal] Build not found: $APP/.next/standalone"; exit 1; }
# Assemble list
TMP="$(mktemp -d)"
mkdir -p "$TMP/bundle"
cp -r "$APP/.next/standalone" "$TMP/bundle/standalone"
cp -r "$APP/.next/static" "$TMP/bundle/static"
cp -r "$APP/public" "$TMP/bundle/public"
cp "$DEP/.env.example" "$TMP/bundle/.env.example"
cp "$BACKEND/scripts/ops/prisma-migrate.sh" "$TMP/bundle/prisma-migrate.sh"
cp "$BACKEND/scripts/ops/health-check.sh" "$TMP/bundle/health-check.sh"
mkdir -p "$TMP/bundle/docker" "$TMP/bundle/pm2"
cp "$DEP/docker/docker-compose.yml" "$TMP/bundle/docker/docker-compose.yml"
cp "$DEP/docker/Caddyfile" "$TMP/bundle/docker/Caddyfile"
cp "$DEP/pm2/ecosystem.config.cjs" "$TMP/bundle/pm2/ecosystem.config.cjs"
# Notes
cat > "$TMP/bundle/DEPLOY_NOTES.md" << 'MD'
# Nexa ERP — Backend Deploy Notes

## Quick Start (Docker)
1) Copy `.env.example` to `.env` and fill real values.
2) Run Prisma migrations:
   ```
   ./prisma-migrate.sh ./ .env
   ```
3) Start:
   ```
   docker compose -f docker/docker-compose.yml up -d
   ```
4) Health:
   ```
   ./health-check.sh https://api.nexaai.co.uk
   ```

## Quick Start (PM2)
1) Build once locally or on the server (standalone already included).
2) Copy `.env.example` to `.env` and fill real values.
3) Install pm2 and start:
   ```
   npm i -g pm2
   pm2 start pm2/ecosystem.config.cjs --env production
   pm2 save
   ```

## Hostinger VPS tips
- Point A records for `app.nexaai.co.uk` and `api.nexaai.co.uk` to the VPS.
- If using Caddy, it will request TLS certs automatically.
- Ensure DB/Redis credentials are secure; do not expose ports publicly.

MD
# Zip + checksum
( cd "$TMP/bundle" && zip -r "$OUT" . >/dev/null )
shasum -a 256 "$OUT" > "${OUT}.sha256"
rm -rf "$TMP"
echo "[ok] Package created:"
echo " - $OUT"
echo " - ${OUT}.sha256"
