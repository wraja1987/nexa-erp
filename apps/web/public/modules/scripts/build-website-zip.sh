#!/usr/bin/env bash
set -euo pipefail
ROOT="apps/web/public/website"
TS=$(date +%Y-%m-%d_%H%M%S)
OUTDIR="ops/site-backups/${TS}"
mkdir -p "$OUTDIR"
manifest() {
  (cd "$ROOT" && find . -type f ! -name ".DS_Store" -print0 | sort -z | xargs -0 shasum -a 256 | sed 's# \*\.#  #' )
}
manifest > "${OUTDIR}/manifest.txt"
(cd "$ROOT" && zip -r "${PWD}/../../../../${OUTDIR}/site.zip" . >/dev/null)
LAST=$(ls -1dt ops/site-backups/* 2>/dev/null | sed -n '2p' || true)
if [ -n "$LAST" ] && [ -f "$LAST/manifest.txt" ]; then
  diff -u "$LAST/manifest.txt" "${OUTDIR}/manifest.txt" > "${OUTDIR}/diff.txt" || true
fi
printf "Built %s with manifest.\n" "$OUTDIR/site.zip"
