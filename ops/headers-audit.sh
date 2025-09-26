#!/usr/bin/env bash
set -euo pipefail
code() { curl -fsS -o /dev/null -w "%{http_code}" "$1" || echo 000; }
hdr () { curl -fsS -I "$1" 2>/dev/null | awk -v H="^$2:" 'BEGIN{IGNORECASE=1}$0~H{gsub(/\r$/,"");$1="";sub(/^: /,"");print;exit}'; }
cors() { curl -fsS -I -H "Origin: https://example.com" "$1" 2>/dev/null | awk 'BEGIN{IGNORECASE=1}/^access-control-allow-origin:/{gsub(/\r$/,"");$1="";sub(/^: /,"");print;exit}'; }
STATIC_URL="${STATIC_URL:-https://$DOMAIN/favicon.ico}"
API_URL="${API_URL:-https://$DOMAIN/api/public/status}"
HTML_URL="${HTML_URL:-https://$DOMAIN/}"
echo "name|status|cache|cors"
for name in static api html; do
  case "$name" in
    static) url="$STATIC_URL" ;;
    api)    url="$API_URL" ;;
    html)   url="$HTML_URL" ;;
  esac
  printf "%s|%s|%s|%s\n" "$name" "$(code "$url")" "$(hdr "$url" cache-control || true)" "$(cors "$url" || true)"
done
