#!/usr/bin/env bash
set -Eeuo pipefail
ZIP_SRC="${1:-}"
ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
ART="$ROOT/artifacts"
REPORTS="$BACKEND/reports"

if [ -z "$ZIP_SRC" ] || [ ! -f "$ZIP_SRC" ]; then
  echo "[fatal] Provide path to website ZIP to archive"; exit 1;
fi

mkdir -p "$ART" "$REPORTS"

# Move ZIP and optional checksum
ZIP_NAME="$(basename "$ZIP_SRC")"
ZIP_BASE="${ZIP_SRC%.zip}"
SHA_SRC="${ZIP_BASE}.sha256"

mv "$ZIP_SRC" "$ART/$ZIP_NAME"
[ -f "$SHA_SRC" ] && mv "$SHA_SRC" "$ART/"

# Refresh reports symlink
ln -sfn "../artifacts/$ZIP_NAME" "$REPORTS/$ZIP_NAME"

echo "[ok] Archived website ZIP:"
ls -lh "$ART/$ZIP_NAME" || true
[ -f "$ART/${ZIP_NAME}.sha256" ] && echo "[ok] SHA256: $ART/${ZIP_NAME}.sha256"
echo "[ok] Reports symlink:"
ls -l "$REPORTS/$ZIP_NAME" || true
