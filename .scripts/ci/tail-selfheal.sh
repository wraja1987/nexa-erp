#!/usr/bin/env bash
set -euo pipefail
BR="${1:-$(git rev-parse --abbrev-ref HEAD)}"
RID="$(gh run list --branch "$BR" --json databaseId,createdAt -L 50 | jq -r "sort_by(.createdAt)|last.databaseId")"
if [ -z "${RID:-}" ] || [ "${RID}" = "null" ]; then
  echo "No runs found on branch: $BR"; exit 1
fi
SELF_HEAL_ID="$(gh run view "$RID" --json jobs --jq ".jobs[] | select(.name==\"self_heal\") | .databaseId")"
if [ -z "${SELF_HEAL_ID:-}" ]; then
  echo "self_heal job not found. Opening run in browser..."
  gh run view "$RID" --web || true
  exit 0
fi
echo "===== self_heal logs (from PR step) ====="
gh run view "$RID" --job "$SELF_HEAL_ID" --log | sed -n "/Create auto-fix PR/,$p"






