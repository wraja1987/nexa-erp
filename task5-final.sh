#!/usr/bin/env bash
set -euo pipefail
REPO="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
SCOPE="waheeds-projects-690d64dd"
VERCEL_TOKEN="bAtyAW555rcnnd5UrnkTLv7p"
ALIAS_HOST="app.nexaai.co.uk"

cd "$REPO"

pnpm -w install
pnpm -w build

DEPLOY_URL="$(
  pnpm dlx vercel deploy --prod --yes --prebuilt --token "$VERCEL_TOKEN" \
  | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -n1
)"
echo "DEPLOY_URL=$DEPLOY_URL"
[ -n "${DEPLOY_URL:-}" ] || { echo "[FATAL] Could not capture DEPLOY_URL"; exit 1; }

pnpm dlx vercel alias set "$DEPLOY_URL" "$ALIAS_HOST" --scope "$SCOPE" --token "$VERCEL_TOKEN"

export PW_BASE_URL="https://$ALIAS_HOST" \
  ADMIN_EMAIL="wraja1987@gmail.com" ADMIN_PASSWORD="Wolfish123" \
  STAFF_EMAIL="sayeedr222@gmail.com" STAFF_PASSWORD="Wolfish123"

pnpm -C apps/web exec playwright test tests/e2e/_helpers/login-admin.spec.ts
pnpm -C apps/web exec playwright test tests/e2e/_helpers/login-staff.spec.ts || true

pnpm -C apps/web exec playwright test tests/e2e/rbac-admin.spec.ts || true
pnpm -C apps/web exec playwright test tests/e2e/rbac-staff-page.prod.spec.ts || true
pnpm -C apps/web exec playwright test tests/e2e/rbac-staff-api.spec.ts || true

node scripts/prodCodes.mjs
sed -n '1,60p'  reports/TASK5-PROD-VERIFICATION.md
sed -n '1,200p' reports/task5-prod-smoke.md
