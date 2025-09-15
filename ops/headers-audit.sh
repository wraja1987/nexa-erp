#!/usr/bin/env bash
set -euo pipefail

# Targets
BASE="${BASE:-https://www.nexaai.co.uk}"
STATIC_URL="${STATIC_URL:-$BASE/favicon.ico}"             # public asset (inherits HTML rule unless overridden)
API_URL="${API_URL:-$BASE/api/public/status}"
HTML_URL="${HTML_URL:-$BASE/}"

get_headers() {
  # GET and print only response headers (first block)
  curl -s -L -X GET -D - "$1" -o /dev/null | awk 'BEGIN{h=1} h && NF{print} /^$/{exit}'
}

probe () {
  local name="$1" url="$2"
  local code headers cache cors
  code=$(curl -s -L -o /dev/null -w "%{http_code}" -X GET "$url" || true)
  headers="$(get_headers "$url" || true)"
  cache=$(printf "%s" "$headers" | awk -F': ' 'BEGIN{IGNORECASE=1} $1=="Cache-Control"{print $2; exit}')
  cors=$(printf "%s" "$headers" | awk -F': ' 'BEGIN{IGNORECASE=1} $1=="Access-Control-Allow-Origin"{print $2; exit}')
  echo "${name}|${code}|${cache}|${cors}"
}

# Try to discover a hashed _next/static asset when base host is localhost
discover_next_static () {
  local base="$1"
  # fetch HTML and scrape a _next/static link
  local html; html=$(curl -s -L -X GET "$base" || true)
  local path; path=$(printf "%s" "$html" | grep -Eo '/_next/static/[^"]+' | head -n1 || true)
  if [ -n "$path" ]; then echo "$base$path"; fi
}

echo "name|status|cache|cors"
probe static "$STATIC_URL"
probe api "$API_URL"
probe html "$HTML_URL"

# If we're checking localhost, try a hashed _next asset too
case "$BASE" in
  http://localhost:3000)
    next_asset="$(discover_next_static "$BASE")"
    if [ -n "$next_asset" ]; then
      probe "_next" "$next_asset"
    fi
  ;;
esac
