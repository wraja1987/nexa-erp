#!/usr/bin/env bash
set -euo pipefail
file="apps/web/.env.local"
ts="$(date +%Y%m%d%H%M%S)"
log="reports/phaseC-env-${ts}.log"
mkdir -p reports
echo "=== Phase C Env Check $(date) ===" | tee "$log"
have(){ k="$1"; grep -E "^[[:space:]]*${k}=" "$file" >/dev/null 2>&1 && echo "✅" || echo "❌"; }
show(){ printf "%-32s %s\n" "$1" "$2" | tee -a "$log"; }
if [ -f "$file" ]; then
  show "STRIPE_WEBHOOK_SECRET" "$(have STRIPE_WEBHOOK_SECRET)"
  show "SENTRY_DSN (optional)" "$(have SENTRY_DSN)"
  show "OTEL_EXPORTER_OTLP_ENDPOINT (optional)" "$(have OTEL_EXPORTER_OTLP_ENDPOINT)"
else
  echo "apps/web/.env.local not found" | tee -a "$log"
fi
echo "=== End Phase C Env Check ===" | tee -a "$log"
echo "LOG_PATH:$log"

