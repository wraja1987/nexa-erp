#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DOMAIN="${DOMAIN:-www.nexaai.co.uk}"
PROTO="${PROTO:-https}"
BASE="$PROTO://$DOMAIN"

echo "== 0) Build web with pnpm (workspace-aware) =="
if command -v pnpm >/dev/null 2>&1; then
  :
else
  corepack enable || true
  corepack prepare pnpm@latest --activate || true
fi
pnpm -r install
pnpm -F web build

echo "== 1) Deploy web =="
if [ -n "${DEPLOY_CMD:-}" ]; then
  echo "DEPLOY_CMD provided → running:"
  echo "$DEPLOY_CMD"
  bash -lc "$DEPLOY_CMD"
elif [ -n "${VERCEL_TOKEN:-}" ]; then
  echo "VERCEL_TOKEN provided → deploying to Vercel (prod)…"
  npx -y vercel --prod --token "$VERCEL_TOKEN"
else
  echo "No DEPLOY_CMD/VERCEL_TOKEN → skipping app deploy (ok if you deploy elsewhere)"
fi

echo "== 2) Apply edge proxy (Nginx) if NGX_HOST is set =="
# Example: NGX_HOST=ubuntu@your.server
if [ -n "${NGX_HOST:-}" ]; then
  NGX_REMOTE_PATH="${NGX_REMOTE_PATH:-/etc/nginx/conf.d/nexa.conf}"
  echo "Pushing ops/proxy/nginx.conf → $NGX_HOST:$NGX_REMOTE_PATH"
  scp -q ops/proxy/nginx.conf "$NGX_HOST:/tmp/nexa.conf"
  ssh -tt "$NGX_HOST" "bash -lc '
    set -e
    sudo mkdir -p \$(dirname \"$NGX_REMOTE_PATH\")
    sudo mv /tmp/nexa.conf \"$NGX_REMOTE_PATH\"
    sudo nginx -t
    if command -v systemctl >/dev/null 2>&1; then
      sudo systemctl reload nginx
    else
      sudo nginx -s reload
    fi
  '"
else
  echo "NGX_HOST not set → skipping edge proxy step."
fi

echo "== 3) Production headers audit =="
export STATIC_URL="$BASE/favicon.ico"
export API_URL="$BASE/api/public/status"
export HTML_URL="$BASE/"
bash ops/headers-audit.sh

echo "== 4) Expected values =="
echo "static|200|public, max-age=31536000, immutable|(none)"
echo "api|200|no-store|https://nexaai.co.uk (or https://www.nexaai.co.uk)"
echo "html|200|s-maxage=60, stale-while-revalidate=300|(none)"
