#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=1
ALERTMANAGER_URL=${ALERTMANAGER_URL:-"http://localhost:9093"}
POLL_TIMEOUT=${POLL_TIMEOUT:-60}

if [[ "${1:-}" == "--yes" ]]; then DRY_RUN=0; shift; fi

action="${1:-}"
arg="${2:-}"

require_yes() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY-RUN: $*"; return 0; fi
}

poll_alert() {
  local expect="$1"; local t=0
  while [[ $t -lt $POLL_TIMEOUT ]]; do
    if curl -s "$ALERTMANAGER_URL/api/v2/alerts" | grep -qi "$expect"; then
      echo "Alert detected: $expect"; return 0; fi
    sleep 5; t=$((t+5))
  done
  echo "FAIL: expected alert not found: $expect"; return 1
}

case "$action" in
  --restart-api)
    target=$(docker ps --format '{{.Names}}' | grep -E 'nexa.*api' || true)
    echo "Target API container: ${target:-none}"
    require_yes docker restart "$target"
    poll_alert "BlackboxProbeFailure" || true
    ;;
  --pause-db)
    secs=${arg:-30}
    db=$(docker ps --format '{{.Names}}' | grep -E 'postgres|pg' | head -1 || true)
    echo "Target DB container: ${db:-none} for ${secs}s"
    require_yes docker pause "$db" && sleep "$secs" && require_yes docker unpause "$db"
    poll_alert "HighLatency|BlackboxProbeFailure|APIFiveXXRateHigh" || true
    ;;
  --simulate-disk)
    tmp_file=${TMPDIR:-/tmp}/nexa-disk-fill.bin
    echo "Simulating disk usage bump (guarded)"
    require_yes bash -c 'dd if=/dev/zero of='"$tmp_file"' bs=100M count=10; rm -f '"$tmp_file"''
    poll_alert "HighDiskUsage" || true
    ;;
  *)
    echo "Usage: $0 [--yes] --restart-api|--pause-db 30|--simulate-disk"; exit 0;
    ;;
esac

