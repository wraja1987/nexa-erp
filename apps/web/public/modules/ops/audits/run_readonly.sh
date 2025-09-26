#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DOMAIN=www.nexaai.co.uk ops/audits/run_readonly.sh
# Defaults to www.nexaai.co.uk if DOMAIN is not set.

DOMAIN="${DOMAIN:-www.nexaai.co.uk}"
ORIGIN="https://${DOMAIN}"

TS="$(date +%Y-%m-%d_%H%M%S)"
AUD_DIR="ops/audits/${DOMAIN}/${TS}"
MON_DIR="ops/monitoring"
RUNBOOK="ops/runbook/runbook.md"

mkdir -p "$AUD_DIR" "$MON_DIR" "$(dirname "$RUNBOOK")"

ua="Mozilla/5.0 NexaOpsBot/1.0"
h()  { curl -sSIL --max-time 20 -H "User-Agent: $ua" "$1"; }
g()  { curl -sS  --max-time 25 -H "User-Agent: $ua" "$1"; }
hh() { h "$1" | sed 's/\r$//'; }
save(){ local f="$AUD_DIR/$1"; shift; printf "%s\n" "$@" > "$f"; echo "wrote $f"; }

echo "== Target: ${ORIGIN}"
echo "== Output: ${AUD_DIR}"

# ----------------------------- DNS snapshot -----------------------------------
{
  echo "# A";    dig +short A    "$DOMAIN"
  echo "# AAAA"; dig +short AAAA "$DOMAIN"
  echo "# CNAME";dig +short CNAME"$DOMAIN"
  echo "# NS";   dig +short NS   "$DOMAIN"
  echo "# TXT";  dig +short TXT  "$DOMAIN"
} > "$AUD_DIR/dns.txt" 2>&1 || true
echo "wrote $AUD_DIR/dns.txt"

# --------------------------- Redirect chain -----------------------------------
{
  for URL in "http://${DOMAIN}" "https://${DOMAIN}"; do
    echo "--- ${URL}"
    curl -sSL -o /dev/null -w '%{url_effective}  %{http_code}\n' -H "User-Agent: $ua" "$URL" || true
  done
} > "$AUD_DIR/redirects.txt"
echo "wrote $AUD_DIR/redirects.txt"

# ------------------------------ TLS snapshot ----------------------------------
TLS_RAW="$AUD_DIR/tls.pem"
echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null \
  | sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' > "$TLS_RAW" || true
{
  echo "# Subject / SAN"
  openssl x509 -noout -subject -ext subjectAltName -in "$TLS_RAW" 2>/dev/null || true
  echo "# Issuer / Validity"
  openssl x509 -noout -issuer  -dates     -in "$TLS_RAW" 2>/dev/null || true
  echo "# SHA256 Fingerprint"
  openssl x509 -noout -fingerprint -sha256 -in "$TLS_RAW" 2>/dev/null || true
} > "$AUD_DIR/tls.txt" || true
echo "wrote $AUD_DIR/tls.txt"

# ------------------------------ Header checks ---------------------------------
STATIC_URL="${ORIGIN}/favicon.ico"
API_URL="${ORIGIN}/api/public/status"
HTML_URL="${ORIGIN}/"

HEADERS_CSV="$AUD_DIR/headers.csv"
echo "name|status|cache|cors|ctype|server|hsts|xcto|xfo|refpol|csp" > "$HEADERS_CSV"

geth(){ awk -v IGNORECASE=1 -v k="$1" 'BEGIN{FS=": *"} tolower($1)==tolower(k){$1="";sub(/^: */," ");print;exit}'; }

audit_one(){
  local name="$1" url="$2" hdr st cache cors ctype server hsts xcto xfo refpol csp
  hdr="$(hh "$url" || true)"
  st="$(printf '%s\n' "$hdr" | head -n1 | awk '{print $2}')" || st=""
  [ -n "${st:-}" ] || st="000"
  cache="$(printf '%s\n' "$hdr" | geth Cache-Control)"
  cors="$(printf  '%s\n' "$hdr" | geth Access-Control-Allow-Origin)"
  ctype="$(printf '%s\n' "$hdr" | geth Content-Type)"
  server="$(printf '%s\n' "$hdr" | geth Server)"
  hsts="$(printf  '%s\n' "$hdr" | geth Strict-Transport-Security)"
  xcto="$(printf  '%s\n' "$hdr" | geth X-Content-Type-Options)"
  xfo="$(printf   '%s\n' "$hdr" | geth X-Frame-Options)"
  refpol="$(printf'%s\n' "$hdr" | geth Referrer-Policy)"
  csp="$(printf   '%s\n' "$hdr" | geth Content-Security-Policy)"
  printf "%s|%s| %s|%s|%s|%s|%s|%s|%s|%s|%s\n" \
    "$name" "$st" "$cache" "$cors" "$ctype" "$server" "$hsts" "$xcto" "$xfo" "$refpol" "$csp" >> "$HEADERS_CSV"
}

audit_one static "$STATIC_URL"
audit_one api    "$API_URL"
audit_one html   "$HTML_URL"

column -s"|" -t "$HEADERS_CSV" | sed 's/^/  /' | tee "$AUD_DIR/headers.table.txt" >/dev/null
echo "wrote $HEADERS_CSV"

# ----------------------- Compression and body samples -------------------------
for u in "$STATIC_URL" "$HTML_URL"; do
  {
    echo "--- $u"
    curl -sSIL --compressed -H "User-Agent: $ua" -H "Accept-Encoding: br,gzip" "$u"
    echo ""
  } >> "$AUD_DIR/compression.txt" || true
done
echo "wrote $AUD_DIR/compression.txt"

for u in "$HTML_URL" "$STATIC_URL"; do
  out="$AUD_DIR/$(echo "$u" | sed 's#https\?://##; s#/#_#g').body"
  g "$u" > "$out" || true
done
echo "wrote content bodies"

# ------------------------------- Evaluation -----------------------------------
TARGET_STATIC="public, max-age=31536000, immutable"
TARGET_HTML="s-maxage=60, stale-while-revalidate=300"
TARGET_API_CACHE="no-store"
TARGET_API_CORS="$ORIGIN"

EVAL="$AUD_DIR/evaluation.txt"
get_row(){ awk -F"|" -v n="$1" '$1==n{print}' "$HEADERS_CSV"; }
field(){ echo "$1" | awk -F"|" -v i="$2" '{print $i}' | sed 's/^ *//; s/ *$//'; }

S_ROW="$(get_row static)"; H_ROW="$(get_row html)"; A_ROW="$(get_row api)"
S_CACHE="$(field "$S_ROW" 3)"; H_CACHE="$(field "$H_ROW" 3)"
A_CACHE="$(field "$A_ROW" 3)"; A_CORS="$(field "$A_ROW" 4)"

ok(){ echo "PASS"; }; bad(){ echo "FAIL"; }

{
  echo "=== Targets ==="
  echo "static.cache: $TARGET_STATIC"
  echo "html.cache:   $TARGET_HTML"
  echo "api.cache:    $TARGET_API_CACHE"
  echo "api.cors:     $TARGET_API_CORS"
  echo
  echo "=== Evaluation ==="
  printf "static cache : %s -> %s\n" "${S_CACHE:-<none>}" \
    $([[ "$S_CACHE" == *"public"* && "$S_CACHE" == *"max-age=31536000"* && "$S_CACHE" == *"immutable"* ]] && ok || echo FAIL)
  printf "html cache   : %s -> %s\n" "${H_CACHE:-<none>}" \
    $([[ "$H_CACHE" == *"s-maxage=60"* && "$H_CACHE" == *"stale-while-revalidate=300"* ]] && ok || echo FAIL)
  printf "api cache    : %s -> %s\n" "${A_CACHE:-<none>}" \
    $([[ "$A_CACHE" == *"no-store"* ]] && ok || echo FAIL)
  printf "api cors     : %s -> %s\n" "${A_CORS:-<none>}" \
    $([[ "$A_CORS" == "$TARGET_API_CORS" ]] && ok || echo FAIL)
} | tee "$EVAL"

echo
echo "============================ SUMMARY ============================"
echo "Domain:       $DOMAIN"
echo "Origin:       $ORIGIN"
echo "Audit folder: $AUD_DIR"
echo "-----------------------------------------------------------------"
echo "Static target: public, max-age=31536000, immutable"
echo "HTML target:   s-maxage=60, stale-while-revalidate=300"
echo "API target:    no-store + CORS scoped to ${ORIGIN}"
echo "================================================================="

#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-www.nexaai.co.uk}"
ORIGIN="https://${DOMAIN}"

TS="$(date +%Y-%m-%d_%H%M%S)"
AUD_DIR="ops/audits/${DOMAIN}/${TS}"
RUNBOOK="ops/runbook/runbook.md"
MON_DIR="ops/monitoring"
PROXY_DIR="ops/proxy"
GHA_DIR=".github/workflows"
mkdir -p "$AUD_DIR" "$(dirname "$RUNBOOK")" "$MON_DIR" "$PROXY_DIR" "$GHA_DIR"

ua="Mozilla/5.0 NexaOpsBot/1.0"
h()  { curl -sSIL --max-time 20 -H "User-Agent: $ua" "$1"; }
g()  { curl -sS  --max-time 25 -H "User-Agent: $ua" "$1"; }
hh() { h "$1" | sed $'s/\r$//'; }

echo "== DNS snapshot =="
{
  echo "# A";    dig +short A     "$DOMAIN"
  echo "# AAAA"; dig +short AAAA  "$DOMAIN"
  echo "# CNAME";dig +short CNAME "$DOMAIN"
  echo "# NS";   dig +short NS    "$DOMAIN"
  echo "# TXT";  dig +short TXT   "$DOMAIN"
} > "$AUD_DIR/dns.txt" 2>&1 || true
echo "wrote $AUD_DIR/dns.txt"

echo "== Redirect chain =="
for URL in "http://${DOMAIN}" "https://${DOMAIN}"; do
  echo "--- $URL" >> "$AUD_DIR/redirects.txt"
  curl -sSL -o /dev/null -w '%{url_effective}  %{http_code}\n' -H "User-Agent: $ua" "$URL" >> "$AUD_DIR/redirects.txt" || true
done
echo "wrote $AUD_DIR/redirects.txt"

echo "== TLS snapshot =="
TLS_RAW="$AUD_DIR/tls.pem"
echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null | sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' > "$TLS_RAW" || true
{
  echo "# Subject / SAN"
  openssl x509 -noout -subject -ext subjectAltName -in "$TLS_RAW" 2>/dev/null || true
  echo "\n# Issuer / Validity"
  openssl x509 -noout -issuer -dates -in "$TLS_RAW" 2>/dev/null || true
  echo "\n# Fingerprint"
  openssl x509 -noout -fingerprint -sha256 -in "$TLS_RAW" 2>/dev/null || true
} > "$AUD_DIR/tls.txt" || true
echo "wrote $AUD_DIR/tls.txt"

STATIC_URL="${ORIGIN}/favicon.ico"
API_URL="${ORIGIN}/api/public/status"
HTML_URL="${ORIGIN}/"

HEADERS_CSV="$AUD_DIR/headers.csv"
echo "name|status|cache|cors|ctype|server|hsts|xcto|xfo|refpol|csp" > "$HEADERS_CSV"

audit_one () {
  local name="$1" url="$2" hdr st cache cors ctype server hsts xcto xfo refpol csp
  hdr="$(hh "$url" || true)"
  st="$(printf '%s\n' "$hdr" | head -n1 | awk '{print $2}')"; [ -n "${st:-}" ] || st="000"
  geth() { printf '%s\n' "$hdr" | awk -v IGNORECASE=1 -v k="$1" 'BEGIN{FS=": *"} tolower($1)==tolower(k){$1="";sub(/^: */," ");print; exit}'; }
  cache="$(geth Cache-Control)"; cors="$(geth Access-Control-Allow-Origin)"
  ctype="$(geth Content-Type)";  server="$(geth Server)"
  hsts="$(geth Strict-Transport-Security)"; xcto="$(geth X-Content-Type-Options)"
  xfo="$(geth X-Frame-Options)"; refpol="$(geth Referrer-Policy)"; csp="$(geth Content-Security-Policy)"
  printf "%s|%s| %s|%s|%s|%s|%s|%s|%s|%s|%s\n" "$name" "$st" "$cache" "$cors" "$ctype" "$server" "$hsts" "$xcto" "$xfo" "$refpol" "$csp" >> "$HEADERS_CSV"
}

echo "== Header checks =="
audit_one static "$STATIC_URL"
audit_one api    "$API_URL"
audit_one html   "$HTML_URL"
column -s'|' -t "$HEADERS_CSV" | sed 's/^/  /'
echo "wrote $HEADERS_CSV"

echo "== Compression & caching =="
for u in "$STATIC_URL" "$HTML_URL"; do
  {
    echo "--- $u"
    curl -sSIL --compressed -H "User-Agent: $ua" -H "Accept-Encoding: br,gzip" "$u"
    echo ""
  } >> "$AUD_DIR/compression.txt" || true
done
echo "wrote $AUD_DIR/compression.txt"

echo "== Fetch content samples =="
for u in "$HTML_URL" "$STATIC_URL"; do
  out="$AUD_DIR/$(echo "$u" | sed 's#https\?://##; s#/#_#g').body"
  g "$u" > "$out" || true
  echo "  $(basename "$out")  $(wc -c < "$out" 2>/dev/null) bytes"
done

TARGET_STATIC="public, max-age=31536000, immutable"
TARGET_HTML="s-maxage=60, stale-while-revalidate=300"
TARGET_API_CACHE="no-store"
TARGET_API_CORS="$ORIGIN"

RESULTS="$AUD_DIR/evaluation.txt"
{
  echo "=== Targets ==="
  echo "static.cache: $TARGET_STATIC"
  echo "html.cache:   $TARGET_HTML"
  echo "api.cache:    $TARGET_API_CACHE"
  echo "api.cors:     $TARGET_API_CORS"
  echo ""

  S_ROW="$(awk -F'|' 'NR>1 && $1=="static"{print}' "$HEADERS_CSV")"
  A_ROW="$(awk -F'|' 'NR>1 && $1=="api"{print}'    "$HEADERS_CSV")"
  H_ROW="$(awk -F'|' 'NR>1 && $1=="html"{print}'   "$HEADERS_CSV")"

  get_field(){ echo "$1" | awk -F'|' -v i="$2" '{print $i}' | sed 's/^ *//; s/ *$//'; }
  S_STATUS="$(get_field "$S_ROW" 2)"; S_CACHE="$(get_field "$S_ROW" 3)"
  H_STATUS="$(get_field "$H_ROW" 2)"; H_CACHE="$(get_field "$H_ROW" 3)"
  A_STATUS="$(get_field "$A_ROW" 2)"; A_CACHE="$(get_field "$A_ROW" 3)"; A_CORS="$(get_field "$A_ROW" 4)"

  echo "=== Evaluation ==="
  printf "static status: %s\n" "${S_STATUS:-000}"
  printf "static cache : %s -> %s\n" "${S_CACHE:-<none>}" $( [[ "$S_CACHE" == *public* && "$S_CACHE" == *max-age=31536000* && "$S_CACHE" == *immutable* ]] && echo PASS || echo FAIL )
  printf "html status  : %s\n" "${H_STATUS:-000}"
  printf "html cache   : %s -> %s\n" "${H_CACHE:-<none>}" $( [[ "$H_CACHE" == *s-maxage=60* && "$H_CACHE" == *stale-while-revalidate=300* ]] && echo PASS || echo FAIL )
  printf "api status   : %s\n" "${A_STATUS:-000}"
  printf "api cache    : %s -> %s\n" "${A_CACHE:-<none>}" $( [[ "$A_CACHE" == *no-store* ]] && echo PASS || echo FAIL )
  printf "api cors     : %s -> %s\n"  "${A_CORS:-<none>}" $( [[ "$A_CORS" == "$TARGET_API_CORS" ]] && echo PASS || echo FAIL )
} > "$RESULTS"
echo "wrote $RESULTS"

echo "\n============================ SUMMARY ============================"
echo "Domain:       $DOMAIN"
echo "Origin:       $ORIGIN"
echo "Audit folder: $AUD_DIR"
echo "-----------------------------------------------------------------"
column -s'|' -t "$HEADERS_CSV" | sed 's/^/  /'
echo "================================================================="


