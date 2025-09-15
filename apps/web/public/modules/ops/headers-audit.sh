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
#!/usr/bin/env bash
set -euo pipefail

ASSET_URL=${ASSET_URL:-"https://nexaai.co.uk/favicon.ico"}
API_URL=${API_URL:-"https://api.nexaai.co.uk/api/public/status"}
HTML_URL=${HTML_URL:-"https://nexaai.co.uk/"}

fetch() {
  local url="$1"
  curl -sSI "$url" | awk 'BEGIN{ORS=""} /^HTTP\//{status=$2} tolower($0) ~ /^cache-control:/{cache=$0} tolower($0) ~ /^access-control-allow-origin:/{cors=$0} END{printf("%s|%s|%s\n", status, cache, cors)}'
}

printf "name|status|cache|cors\n"
printf "static|%s\n" "$(fetch "$ASSET_URL")"
printf "api|%s\n" "$(fetch "$API_URL")"
printf "html|%s\n" "$(fetch "$HTML_URL")"

