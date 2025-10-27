#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root relative to this script
REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
WEB_DIR="$REPO_DIR/apps/web"

cd "$REPO_DIR"

echo "[pricing] Scan for price-like strings…"
RG_FILES=$(rg -l -N --no-ignore-vcs \
  -g '!**/node_modules/**' \
  -e '£\s*\d[\d,]*(\.\d+)?' \
  -e '\\b/month\\b' \
  -e '\\bper\\s+month\\b' \
  apps/web || true)

echo "$RG_FILES" | sed '/^$/d' > /tmp/nexa_price_files.txt || true
FILE_COUNT=$(wc -l < /tmp/nexa_price_files.txt 2>/dev/null || echo 0)
echo "[pricing] Files matched: $FILE_COUNT"

if [[ -s /tmp/nexa_price_files.txt ]]; then
  echo "[pricing] Neutralising explicit prices and '/month' text…"
  # shellcheck disable=SC2013
  for f in $(cat /tmp/nexa_price_files.txt); do
    [[ -f "$f" ]] || continue
    perl -0777 -i -pe 's/£\s*\d[\d,]*(\.\d+)?\s*\/\s*month/Contact us/gi' "$f"
    perl -0777 -i -pe 's/£\s*\d[\d,]*(\.\d+)?\s*per\s*month/Contact us/gi' "$f"
    perl -0777 -i -pe 's/£\s*\d[\d,]*(\.\d+)?/Contact us/g' "$f"
    perl -0777 -i -pe 's/\s*\/\s*month//gi' "$f"
    perl -0777 -i -pe 's/\bper\s+month\b//gi' "$f"
    # Replace numeric price fields (unquoted) to null
    perl -0777 -i -pe 's/\bprice\s*[:=]\s*\d[\d,]*(\.\d+)?/price: null/gi' "$f"
  done
fi

echo "[pricing] Defensive replace inside JSX price nodes…"
RG_PRICE_NODES=$(rg -l -N --no-ignore-vcs \
  -g '!**/node_modules/**' \
  -e 'class(Name)?=.*price' \
  -e 'data-testid=.?(price|plan-price)' \
  apps/web || true)

if [[ -n "$RG_PRICE_NODES" ]]; then
  # shellcheck disable=SC2013
  for f in $RG_PRICE_NODES; do
    [[ -f "$f" ]] || continue
    perl -0777 -i -pe 's/(<([a-zA-Z0-9:_-]+)[^>]*?(class|data-testid)=[^>]*?(price|plan-price)[^>]*>)[\s\S]*?(<\/\2>)/$1Contact us$5/g' "$f"
  done
fi

echo "[pricing] Building apps/web…"
if command -v pnpm >/dev/null 2>&1; then
  pnpm -C "$WEB_DIR" build
else
  corepack enable >/dev/null 2>&1 || true
  pnpm -v >/dev/null 2>&1 || npm i -g pnpm@10 >/dev/null 2>&1
  pnpm -C "$WEB_DIR" build
fi

echo "[pricing] Committing changes…"
git add -A
git commit -m "feat(pricing): remove public prices; replace with \"Contact us\" across pricing page/components" || true

echo "[pricing] Remaining price-like strings under apps/web:"
rg -n --no-ignore-vcs apps/web -e '£\s*\d[\d,]*(\.\d+)?' -e '\\b/month\\b' -e '\\bper\\s+month\\b' || true

echo "[pricing] Done. Push the branch if ready:"
echo "  git push -u origin $(git rev-parse --abbrev-ref HEAD)"


