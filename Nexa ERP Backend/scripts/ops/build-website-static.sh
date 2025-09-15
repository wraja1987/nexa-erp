#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
WEBSITE_STATIC="$ROOT/apps/website-static"
ARCHIVER="$ROOT/Nexa ERP Backend/scripts/ops/website-archive.sh"

[ -d "$WEBSITE_STATIC" ] || { echo "[fatal] apps/website-static not found at $WEBSITE_STATIC"; exit 1; }

# Ensure pnpm and install deps at root once (idempotent)
( corepack enable >/dev/null 2>&1 || true )
( cd "$ROOT" && pnpm -v >/dev/null && pnpm -w install )

# Build the static site
( cd "$WEBSITE_STATIC" && pnpm build )

# Zip the out folder to a timestamped file in $HOME (Hostinger-ready)
TS="$(date +%Y%m%d%H%M%S)"
ZIP_OUT="$HOME/nexa-static-hostinger-${TS}.zip"
( cd "$WEBSITE_STATIC/out" && zip -r "$ZIP_OUT" . >/dev/null )

# Generate checksum
shasum -a 256 "$ZIP_OUT" > "${ZIP_OUT}.sha256"

# Archive (move to artifacts + refresh reports symlink)
"$ARCHIVER" "$ZIP_OUT"

echo "[ok] Build + archive complete."
