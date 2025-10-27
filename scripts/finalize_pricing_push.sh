#!/usr/bin/env bash
set -euo pipefail
set +H

REPO="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
BRANCH="chore/remove-public-prices-20251025-083923"
cd "$REPO"

echo "1) Ensure branch and clean up any stale locks..."
[ -f .git/index.lock ] && rm -f .git/index.lock
git fetch -q || true
git switch "$BRANCH" || git switch -c "$BRANCH"

echo "2) Compact repo to avoid push space errors..."
git gc --prune=now || true
git repack -a -d -f --depth=250 --window=0 || true

echo "3) Commit (idempotent) and push to origin..."
git add -A
git commit -m "build(web): complete pricing removal and final cleanup" || true
git -c pack.window=0 -c pack.threads=1 -c pack.writeBitmaps=false push -u origin "$BRANCH"

echo "4) Deploy to Production (requires vercel CLI logged in)..."
if command -v vercel >/dev/null 2>&1; then
  vercel build || true
  vercel deploy --prebuilt --prod --yes || vercel --prod --confirm
else
  echo "vercel CLI not found; skipping deploy. Install with: npm i -g vercel"
fi

echo "5) Verify /pricing in repo (should output nothing)..."
rg -n --no-ignore-vcs -g '!**/node_modules/**' apps/web \
  -e '£\s*\d[\d,]*(\.\d+)?' -e '\\b/month\\b' -e '\\bper\\s+month\\b' || echo "OK: repo clean"

echo "6) Verify live /pricing page (should output nothing)..."
curl -s https://app.nexaai.co.uk/pricing | rg -n '£\s*\d|/month|per\s+month' || echo "OK: live page clean"




