#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

run_pm() {
  local dir="$1"; shift
  if command -v pnpm >/dev/null; then (cd "$dir" && pnpm "$@" )
  elif command -v npm >/dev/null; then (cd "$dir" && npm run "$@" )
  else (cd "$dir" && yarn "$@" ); fi
}

has_script() {
  local dir="$1" name="$2"
  [ -f "$dir/package.json" ] && node -e "console.log(!!(require('$dir/package.json').scripts||{})['$name'])"
}

start_local() {
  local pidfile="/tmp/nexa-next.pid"
  [ -f "$pidfile" ] && kill "$(cat "$pidfile")" 2>/dev/null || true
  rm -f "$pidfile"
  # build
  if has_script "$ROOT/apps/web" build | grep -q true; then run_pm "$ROOT/apps/web" build; else (cd "$ROOT/apps/web" && npx next build); fi
  # start
  if has_script "$ROOT/apps/web" start | grep -q true; then
    (cd "$ROOT/apps/web" && (run_pm "$ROOT/apps/web" start -- -p 3000 >/tmp/nexa-next.log 2>&1 & echo $! > "$pidfile"))
  else
    (cd "$ROOT/apps/web" && (npx next start -p 3000 >/tmp/nexa-next.log 2>&1 & echo $! > "$pidfile"))
  fi
  for i in {1..60}; do curl -fsS http://localhost:3000 >/dev/null 2>&1 && break; sleep 0.5; done
}

stop_local() {
  local pidfile="/tmp/nexa-next.pid"
  [ -f "$pidfile" ] && kill "$(cat "$pidfile")" 2>/dev/null || true
  rm -f "$pidfile" || true
}

audit() {
  local STATIC_URL="$1" API_URL="$2" HTML_URL="$3"
  STATIC_URL="$STATIC_URL" API_URL="$API_URL" HTML_URL="$HTML_URL" bash "$ROOT/ops/headers-audit.sh"
}

deploy_if_possible() {
  if has_script "$ROOT" deploy | grep -q true; then run_pm "$ROOT" deploy; return 0; fi
  if has_script "$ROOT/apps/web" deploy | grep -q true; then run_pm "$ROOT/apps/web" deploy; return 0; fi
  return 1
}

edge_patch_if_possible() {
  if [ -n "${HOST_SSH:-}" ] && [ -n "${HOST_WEB_ROOT:-}" ]; then
    scp "$ROOT/ops/proxy/nginx.conf" "$HOST_SSH:$HOST_WEB_ROOT/nginx/nexa.conf"
    ssh "$HOST_SSH" "${SUDO_CMD:-sudo} nginx -t && ${SUDO_CMD:-sudo} systemctl reload nginx"
    return 0
  fi
  return 1
}

echo "=== Local build → start prod server → audit localhost ==="
start_local
audit "http://localhost:3000/favicon.ico" "http://localhost:3000/api/public/status" "http://localhost:3000/"
stop_local

echo "=== Try to deploy (if deploy script exists), then audit production ==="
if deploy_if_possible; then :; else
  echo "No deploy script found. You must deploy your app for production headers to appear."
fi

PROD_TABLE="$(bash "$ROOT/ops/headers-audit.sh")"
echo "$PROD_TABLE"

need_headers=false
while IFS='|' read -r name status cache cors ; do
  [ "$name" = "name" ] && continue
  if [ "$status" != "200" ] || [ -z "$cache" ] || { [ "$name" = "api" ] && [ -z "$cors" ]; }; then
    need_headers=true
  fi
done <<< "$PROD_TABLE"

if $need_headers; then
  echo "Production missing headers/CORS. Trying edge proxy patch if SSH envs are set…"
  if edge_patch_if_possible; then
    echo "Edge patched. Re-auditing in 5s…"; sleep 5
    bash "$ROOT/ops/headers-audit.sh"
    exit 0
  else
    echo "Set SSH envs to auto-patch edge, then re-run:"
    echo '  export HOST_SSH="user@server"'
    echo '  export HOST_WEB_ROOT="/var/www/nexa"'
    echo '  export SUDO_CMD="sudo"'
    echo "or add a deploy script, then run: bash ops/fix-and-verify.sh"
    exit 1
  fi
else
  echo "Headers & CORS: PASS"
  exit 0
fi



