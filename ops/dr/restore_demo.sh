#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
# Prefer custom .dump; fallback to latest plain SQL if ever needed
DUMP="$(ls -t ops/backups/demo/*.dump 2>/dev/null | head -n1 || true)"
SQLF="$(ls -t reports/backup-*.sql    2>/dev/null | head -n1 || true)"
if [ -n "$DUMP" ]; then
  echo "▶️  DR restore (custom dump, --clean) ← $DUMP"
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$DATABASE_URL" "$DUMP"
  echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"dr.restore_demo.ok\",\"file\":\"$DUMP\"}" >> reports/audit.jsonl
  echo "✅ Restore complete (custom dump)"
elif [ -n "$SQLF" ]; then
  echo "▶️  DR restore (SQL file)   ← $SQLF"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQLF"
  echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"action\":\"dr.restore_demo.ok\",\"file\":\"$SQLF\"}" >> reports/audit.jsonl
  echo "✅ Restore complete (SQL file)"
else
  echo "❌ No backup found (ops/backups/demo/*.dump or reports/backup-*.sql)"; exit 1
fi
