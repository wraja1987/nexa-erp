#!/usr/bin/env bash
set -e
file="apps/web/.env.local"
ts="$(date +%Y%m%d%H%M%S)"
log="reports/phaseA-env-${ts}.log"
mkdir -p reports

echo "=== Environment Matrix $(date) ===" | tee "$log"

have() {
  local k="$1"
  if grep -E "^[[:space:]]*${k}=" "$file" >/dev/null 2>&1; then
    echo "✅"
  else
    echo "❌"
  fi
}

show() {
  printf "%-40s %s\n" "$1" "$2" | tee -a "$log"
}

missing=""

if [ -f "$file" ]; then
  ob_env=$(grep -E "^[[:space:]]*OPEN_BANKING_ENV=" "$file" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]') || ob_env=""
  hm_env=$(grep -E "^[[:space:]]*HMRC_ENVIRONMENT="   "$file" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]') || hm_env=""

  show "Stripe: STRIPE_SECRET_KEY"               "$(have STRIPE_SECRET_KEY)"
  show "Open Banking: OPEN_BANKING_CLIENT_ID"    "$(have OPEN_BANKING_CLIENT_ID)"
  show "Open Banking: OPEN_BANKING_CLIENT_SECRET" "$(have OPEN_BANKING_CLIENT_SECRET)"
  if [ "$ob_env" = "sandbox" ]; then show "Open Banking: OPEN_BANKING_ENV=sandbox" "✅"; else show "Open Banking: OPEN_BANKING_ENV=sandbox" "❌"; fi
  show "HMRC: HMRC_CLIENT_ID"                    "$(have HMRC_CLIENT_ID)"
  show "HMRC: HMRC_CLIENT_SECRET"                "$(have HMRC_CLIENT_SECRET)"
  if [ "$hm_env" = "sandbox" ]; then show "HMRC: HMRC_ENVIRONMENT=sandbox" "✅"; else show "HMRC: HMRC_ENVIRONMENT=sandbox" "❌"; fi
  show "HMRC: HMRC_VRN"                          "$(have HMRC_VRN)"
  show "Twilio: TWILIO_ACCOUNT_SID"              "$(have TWILIO_ACCOUNT_SID)"
  show "Twilio: TWILIO_AUTH_TOKEN"               "$(have TWILIO_AUTH_TOKEN)"

  for k in STRIPE_SECRET_KEY OPEN_BANKING_CLIENT_ID OPEN_BANKING_CLIENT_SECRET HMRC_CLIENT_ID HMRC_CLIENT_SECRET HMRC_VRN TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN; do
    if ! grep -q "^[[:space:]]*$k=" "$file"; then missing="$missing $k"; fi
  done
  [ "$ob_env" = "sandbox" ] || missing="$missing OPEN_BANKING_ENV(sandbox)"
  [ "$hm_env" = "sandbox" ] || missing="$missing HMRC_ENVIRONMENT(sandbox)"
else
  echo "apps/web/.env.local not found" | tee -a "$log"
  missing="ALL"
fi

echo "=== End env matrix ===" | tee -a "$log"
echo "LOG_PATH:$log"
echo "MISSING_KEYS:$missing"
