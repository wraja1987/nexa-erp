#!/usr/bin/env bash
set -euo pipefail
set +H

SRC="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
BRANCH="chore/remove-public-prices-20251025-083923"
CLEAN="$HOME/Desktop/Nexa ERP CLEAN PUSH"
PATCHDIR="/tmp/nexa_pricing_patches"

echo "[1/6] Restore tracked files in source repo"
mkdir -p "$SRC"
cd "$SRC"
[ -f .git/index.lock ] && rm -f .git/index.lock || true
git reset --hard HEAD

echo "[2/6] Create patches for unpushed commits"
git fetch origin --prune || true

# Determine remote default branch (origin/HEAD), fallback to main or master
DEFAULT_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | cut -d/ -f2 || true)
if [[ -z "${DEFAULT_BRANCH:-}" ]]; then
  DEFAULT_BRANCH=$(git branch -r | awk -F'origin/' '/origin\/main$|origin\/master$/{print $2; exit}')
fi
DEFAULT_BRANCH=${DEFAULT_BRANCH:-main}

BASE_REF="origin/$BRANCH"
if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  BASE_REF="origin/$DEFAULT_BRANCH"
fi

rm -rf "$PATCHDIR"
mkdir -p "$PATCHDIR"
git format-patch "$BASE_REF"..HEAD -o "$PATCHDIR" || true

PATCH_COUNT=$(ls -1 "$PATCHDIR" 2>/dev/null | wc -l | tr -d ' ')
echo "Patches generated: ${PATCH_COUNT:-0}"

echo "[3/6] Clean clone and push"
URL="$(git config --get remote.origin.url)"
rm -rf "$CLEAN"
mkdir -p "$CLEAN"
# Clone shallow on default branch to minimize local objects
git clone --filter=blob:none --depth=1 "$URL" "$CLEAN"
cd "$CLEAN"
git switch -c "$BRANCH" || git checkout -b "$BRANCH"

if compgen -G "$PATCHDIR/*.patch" > /dev/null; then
  git am "$PATCHDIR"/*.patch
else
  echo "No patches to apply; branch will match $BASE_REF"
fi

# Push with conservative pack settings (reduced temp usage)
git -c pack.window=0 -c pack.threads=1 -c pack.writeBitmaps=false push -u origin "$BRANCH"

echo "[4/6] Verify repo pricing (should be empty)"
rg -n --no-ignore-vcs -g '!**/node_modules/**' apps/web \
  -e '£\s*\d[\d,]*(\.\d+)?' -e '\\b/month\\b' -e '\\bper\\s+month\\b' || echo "OK: repo clean"

echo "[5/6] Optional deploy"
if command -v vercel >/dev/null 2>&1; then
  vercel build || true
  vercel deploy --prebuilt --prod --yes || vercel --prod --confirm
else
  echo "vercel CLI not found; skipping deploy."
fi

echo "[6/6] Verify live pricing (should be empty)"
curl -s https://app.nexaai.co.uk/pricing | rg -n '£\s*\d|/month|per\s+month' || echo "OK: live page clean"




