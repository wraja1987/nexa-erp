#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports/ops
OUT="reports/ops/uptime-weekly-$(date +%Y%m%d).md"
APP="https://app.nexaai.co.uk/login"
API="https://app.nexaai.co.uk/api/kpi/dashboard"

probe() {
  local name="$1" url="$2"
  local code time
  time=$(date -Is)
  code=$(curl -fsS -o /dev/null -w "%{http_code}" "$url" || echo 000)
  echo "- ${time} ${name}: HTTP ${code} ${url}" >> "$OUT"
}

echo "# Nexa Uptime Weekly Report — $(date -Is)" > "$OUT"
probe "App" "$APP"
probe "API" "$API"
if command -v openssl >/dev/null 2>&1; then
  exp=$(openssl s_client -connect app.nexaai.co.uk:443 -servername app.nexaai.co.uk </dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2 || true)
  if [ -n "${exp:-}" ]; then
    days=$(( ( $(date -d "$exp" +%s) - $(date +%s) )/86400 ))
    echo "- SSL: certificate expires on ${exp} (in ${days} days)" >> "$OUT"
  fi
fi
echo "" >> "$OUT"

