#!/usr/bin/env bash
set -euo pipefail
BR=${1:?usage: scripts/new-pr.sh <branch-name>}
git checkout -b "$BR"
git push -u origin "$BR"
# If gh CLI is available, open a PR; otherwise print next steps
if command -v gh >/dev/null 2>&1; then
  gh pr create --fill || true
else
  echo "Open a PR from $BR → main on GitHub."
fi



