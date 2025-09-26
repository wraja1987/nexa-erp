#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-www.nexaai.co.uk}"
ORIGIN="https://${DOMAIN}"

TS="$(date +%Y-%m-%d_%H%M%S)"
AUD_DIR="ops/audits/${DOMAIN}/${TS}"
mkdir -p "$AUD_DIR"

ua="Mozilla/5.0 NexaOpsBot/1.0"
h()  { curl -sSIL --max-time 20 -H "User-Agent: $ua" "$1"; }
g()  { curl -sS  --max-time 25 -H "User-Agent: $ua" "$1"; }
hh() { h "$1" | sed 's/\r$//'; }

echo "== Target: ${ORIGIN}"
echo "== Output: ${AUD_DIR}"

# DNS snapshot
{
  echo "# A";    dig +short A    "$DOMAIN"
  echo "# AAAA"; dig +short AAAA "$DOMAIN"
  echo "# CNAME";dig +short CNAME "$DOMAIN"
  echo "# NS";   dig +short NS   "$DOMAIN"
  echo "# TXT";  dig +short TXT  "$DOMAIN"
} > "$AUD_DIR/dns.txt" 2>&1 || true

# Headers (static/api/html)
STATIC_URL="${ORIGIN}/favicon.ico"
API_URL="${ORIGIN}/api/public/status"
HTML_URL="${ORIGIN}/"

HEADERS_CSV="$AUD_DIR/headers.csv"
echo "name|status|cache|cors|content-type|server" > "$HEADERS_CSV"

geth(){ awk -v IGNORECASE=1 -F': *' -v k="$1" 'tolower($1)==tolower(k){print $2; exit}'; }

audit_one () {
  local name="$1" url="$2" hdr st
  hdr="$(hh "$url" || true)"
  st="$(printf '%s\n' "$hdr" | head -n1 | awk '{print $2}')"; [ -n "${st:-}" ] || st="000"
  printf "%s|%s| %s|%s|%s|%s\n" \
    "$name" "$st" \
    "$(printf '%s\n' "$hdr" | geth Cache-Control)" \
    "$(printf '%s\n' "$hdr" | geth Access-Control-Allow-Origin)" \
    "$(printf '%s\n' "$hdr" | geth Content-Type)" \
    "$(printf '%s\n' "$hdr" | geth Server)" \
    >> "$HEADERS_CSV"
}

audit_one static "$STATIC_URL"
audit_one api    "$API_URL"
audit_one html   "$HTML_URL"

column -s"|" -t "$HEADERS_CSV" | tee "$AUD_DIR/headers.table.txt" >/dev/null

# PASS/FAIL evaluation
TARGET_STATIC="public, max-age=31536000, immutable"
TARGET_HTML="s-maxage=60, stale-while-revalidate=300"
TARGET_API_CACHE="no-store"
TARGET_API_CORS="$ORIGIN"

row(){ awk -F'|' -v k="$1" '$1==k{print}' "$HEADERS_CSV"; }
field(){ echo "$1" | awk -F'|' -v i="$2" '{print $i}' | sed 's/^ *//; s/ *$//'; }

S_ROW="$(row static)"; H_ROW="$(row html)"; A_ROW="$(row api)"
S_CACHE="$(field "$S_ROW" 3)"
H_CACHE="$(field "$H_ROW" 3)"
A_CACHE="$(field "$A_ROW" 3)"
A_CORS="$(field "$A_ROW" 4)"

PASS_S=$([[ "$S_CACHE" == *public* && "$S_CACHE" == *max-age=31536000* && "$S_CACHE" == *immutable* ]] && echo PASS || echo FAIL)
PASS_H=$([[ "$H_CACHE" == *s-maxage=60* && "$H_CACHE" == *stale-while-revalidate=300* ]] && echo PASS || echo FAIL)
PASS_A=$([[ "$A_CACHE" == *no-store* ]] && echo PASS || echo FAIL)
PASS_C=$([[ "$A_CORS" == "$TARGET_API_CORS" ]] && echo PASS || echo FAIL)

{
  echo "=== Evaluation (targets)"
  echo "  static.cache: $TARGET_STATIC   -> $PASS_S"
  echo "  html.cache:   $TARGET_HTML     -> $PASS_H"
  echo "  api.cache:    $TARGET_API_CACHE -> $PASS_A"
  echo "  api.cors:     $TARGET_API_CORS  -> $PASS_C"
} | tee "$AUD_DIR/evaluation.txt"

echo
echo "Audit folder: $AUD_DIR"
