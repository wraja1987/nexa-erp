#!/usr/bin/env bash
set -euo pipefail

BR="chore/selfheal-pr-perms-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BR"

# Commit everything we added earlier (ignore if missing)
git add \
  playwright.selfheal.config.js \
  scripts/selfheal/compress-images.mjs \
  .github/workflows/verify-and-self-heal.yml \
  selfheal/prod-verify.spec.js || true

git commit -m "ci(self-heal): isolate Playwright; resilient compression; PR perms; always re-verify" || echo "Nothing to commit"
git push -u origin "$BR" || true

# Open PR (idempotent)
gh pr create -B main -t "ci(self-heal): isolate Playwright & resilient self-heal" \
  -b "Run only selfheal Playwright; avoid Vitest/Jest; non-fatal compression; auto PR; re-verify after heal." || true

# Dispatch workflow
PROD_URL="https://nexaai.co.uk"
gh workflow run "verify-and-self-heal.yml" --ref "$BR" -f prod_url="$PROD_URL"

# Find the latest run on this branch and show self_heal logs
sleep 6
RID="$(
  gh run list --json databaseId,createdAt,headBranch -L 100 |
  jq -r --arg BR "$BR" '[.[] | select(.headBranch==$BR)] | sort_by(.createdAt) | last.databaseId // empty'
)"
echo "Run: ${RID:-<none>}"

if [ -n "${RID:-}" ]; then
  echo "Jobs:"
  gh run view "$RID" --json jobs --jq '.jobs[] | {id:.databaseId, name:.name, conclusion:.conclusion}'
  SELF_HEAL_ID="$(gh run view "$RID" --json jobs --jq '.jobs[] | select(.name=="self_heal") | .databaseId')"
  echo "self_heal job: ${SELF_HEAL_ID:-<none>}"
  if [ -n "${SELF_HEAL_ID:-}" ]; then
    echo "===== self_heal: PR step logs ====="
    gh run view "$RID" --job "$SELF_HEAL_ID" --log | sed -n '/Create auto-fix PR/,$p'
  else
    echo "No self_heal job id yet; opening run in browser…"
    gh run view "$RID" --web || true
  fi
else
  echo "No run detected yet. Recent runs on this branch:"
  gh run list --branch "$BR" -L 20
fi
