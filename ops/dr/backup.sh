#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
OUT="ops/backups/demo/${TS}.dump"
echo "▶️  DR backup (custom) → $OUT"
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file="$OUT"
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"dr.backup.ok\",\"file\":\"$OUT\"}" >> reports/audit.jsonl
echo "✅ Backup complete: $OUT"
