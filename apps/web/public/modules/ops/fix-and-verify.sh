#!/usr/bin/env bash
set -euo pipefail

# Requires (optional) envs for proxy push:
# HOST_SSH="user@server"  HOST_WEB_ROOT="/var/www/nexa"  SUDO_CMD="sudo"
# Remote conf path used: $HOST_WEB_ROOT/nginx/nexa.conf

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
AUDIT="$ROOT_DIR/ops/headers-audit.sh"
NGINX_CONF_LOCAL="$ROOT_DIR/ops/proxy/nginx.conf"
REMOTE_CONF_PATH="${HOST_WEB_ROOT:-/var/www/nexa}/nginx/nexa.conf"

attempt_fix() {
  if npm run -s deploy 2>/dev/null || pnpm -s deploy 2>/dev/null || yarn -s deploy 2>/dev/null; then
    echo "Deploy invoked."; return 0; fi

  if [[ -n "${HOST_SSH:-}" && -n "${HOST_WEB_ROOT:-}" ]]; then
    echo "Pushing proxy headers to $HOST_SSH:$REMOTE_CONF_PATH"
    scp "$NGINX_CONF_LOCAL" "$HOST_SSH:$REMOTE_CONF_PATH"
    ssh "$HOST_SSH" "${SUDO_CMD:-sudo} nginx -t && ${SUDO_CMD:-sudo} systemctl reload nginx"
    return 0
  fi

  echo "TODO: deploy app for header changes or set SSH envs to push proxy headers" >&2
  return 1
}

cycles=0
while (( cycles < 3 )); do
  table="$($AUDIT || true)"
  echo "$table"
  # Parse statuses
  static_status=$(echo "$table" | awk -F'|' '/^static\|/{print $2}' | tail -1)
  api_status=$(echo "$table" | awk -F'|' '/^api\|/{print $2}' | tail -1)
  html_status=$(echo "$table" | awk -F'|' '/^html\|/{print $2}' | tail -1)

  if [[ "$static_status" != "200" || "$api_status" != "200" || "$html_status" != "200" ]]; then
    echo "production unreachable or redirects wrong" >&2
    exit 1
  fi

  # Check headers
  static_cache=$(echo "$table" | awk -F'|' '/^static\|/{print $3}' | tail -1)
  api_cache=$(echo "$table" | awk -F'|' '/^api\|/{print $3}' | tail -1)
  html_cache=$(echo "$table" | awk -F'|' '/^html\|/{print $3}' | tail -1)
  api_cors=$(echo "$table" | awk -F'|' '/^api\|/{print $4}' | tail -1)

  ok_static=$(echo "$static_cache" | grep -qi 'immutable' && echo ok || echo no)
  ok_api=$(echo "$api_cache" | grep -qi 'no-store' && echo ok || echo no)
  ok_html=$(echo "$html_cache" | grep -qi 's-maxage=60' && echo ok || echo no)
  ok_cors=$(test -n "$api_cors" && echo ok || echo no)

  if [[ "$ok_static" == ok && "$ok_api" == ok && "$ok_html" == ok && "$ok_cors" == ok ]]; then
    echo "Headers & CORS: PASS"
    exit 0
  fi

  ((cycles++))
  echo "Attempting fix cycle $cycles..."
  attempt_fix || true
done

echo "Headers & CORS: FAIL"
exit 1

