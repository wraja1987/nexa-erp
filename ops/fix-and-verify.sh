#!/usr/bin/env bash
set -euo pipefail
echo "=== Local prod build & verify ==="
rm -rf apps/web/.next
( cd apps/web && npm run build && (npm run start -- -p 3000 >/tmp/nexa-next.log 2>&1 & echo $! >/tmp/nexa-next.pid) )
for i in {1..30}; do curl -fsS http://localhost:3000 >/dev/null 2>&1 && break; sleep 1; done
STATIC_URL="http://localhost:3000/favicon.ico" API_URL="http://localhost:3000/api/public/status" HTML_URL="http://localhost:3000/" bash ops/headers-audit.sh || true
if [ -f /tmp/nexa-next.pid ]; then kill $(cat /tmp/nexa-next.pid)||true; fi
echo "=== Production audit ==="
bash ops/headers-audit.sh || true
if [ "${HOST_SSH:-}" != "" ]; then
  echo "=== Edge patch via SSH ==="
  scp ops/proxy/nginx.conf "$HOST_SSH:$HOST_WEB_ROOT/nexa.conf"
  ssh $HOST_SSH "${SUDO_CMD:-sudo} nginx -t && ${SUDO_CMD:-sudo} systemctl reload nginx"
  bash ops/headers-audit.sh || true
fi
