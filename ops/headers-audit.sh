#!/usr/bin/env bash
set -euo pipefail
# Follows redirects and prints key headers
STATIC_URL="${STATIC_URL:-https://www.nexaai.co.uk/favicon.ico}"
API_URL="${API_URL:-https://www.nexaai.co.uk/api/public/status}"
HTML_URL="${HTML_URL:-https://www.nexaai.co.uk/}"

probe () {
  local name="$1" url="$2"
  code=$(curl -s -L -o /dev/null -w "%{http_code}" "$url" || true)
  headers=$(curl -sI -L "$url" || true)
  cache=$(printf "%s" "$headers" | awk -F': ' 'BEGIN{IGNORECASE=1} $1=="Cache-Control"{print $2; exit}')
  cors=$(printf "%s" "$headers" | awk -F': ' 'BEGIN{IGNORECASE=1} $1=="Access-Control-Allow-Origin"{print $2; exit}')
  echo "${name}|${code}|${cache}|${cors}"
}
echo "name|status|cache|cors"
probe static "$STATIC_URL"
probe api "$API_URL"
probe html "$HTML_URL"
