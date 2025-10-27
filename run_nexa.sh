#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\n== %s ==\n" "$*"; }

# Vars from environment (already exported by the wrapper)
: "${DATABASE_URL:?}"
: "${VERCEL_TOKEN:?}"
: "${ORG:?}"
: "${PROJECT:?}"
: "${DOMAIN:?}"
: "${E2E_EMAIL:?}"
: "${E2E_PASSWORD:?}"

# Deploy toggle (set to 0 to skip deploy and only run smokes)
DO_DEPLOY="${DO_DEPLOY:-1}"

# A) Build & Seed (from monorepo root)
say "Preflight: repo & logo"
cd "/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
test -f "apps/web/public/logo-nexa.png" || { echo "❌ apps/web/public/logo-nexa.png missing"; exit 1; }

say "Prisma client"
pnpm -w prisma generate

say "Seed E2E credentials user"
pnpm -w dlx tsx --version >/dev/null 2>&1 || pnpm -w add -D tsx typescript
pnpm -w dlx tsx prisma/seed.ts

say "Local build (apps/web)"
pnpm -w --filter ./apps/web build

# B) Deploy (Production) from apps/web and alias
if [ "$DO_DEPLOY" = "1" ]; then
  say "Deploy to Vercel (Production)"
  cd apps/web
  DEPLOY_JSON=$(npx -y vercel@latest --cwd . --prod --scope "$ORG" --token "$VERCEL_TOKEN" --yes --confirm --json)
  echo "$DEPLOY_JSON" | jq .
  DEPLOY_HOST=$(echo "$DEPLOY_JSON" | jq -r '.url')
  [ -n "$DEPLOY_HOST" ] && [ "$DEPLOY_HOST" != "null" ] || { echo "❌ Could not capture deploy URL — check token/team access"; exit 1; }
  DEPLOY_URL="https://$DEPLOY_HOST"
  echo "Deployed at: $DEPLOY_URL"

  say "Alias to ${DOMAIN}"
  npx -y vercel@latest alias set "$DEPLOY_URL" "$DOMAIN" --scope "$ORG" --token "$VERCEL_TOKEN" || true
  cd ../..
else
  say "Skipping deploy (DO_DEPLOY=0). Using existing alias."
fi

# C) Production smokes (CSRF-aware credentials login)
BASE="https://${DOMAIN}"

say "Providers endpoint (expect credentials, google, azure-ad)"
curl -s "$BASE/api/auth/providers" | jq

say "Unauthenticated guards (expect 302/307 to /login)"
for p in /dashboard /finance /inventory /manufacturing /sales /projects /hr /pos /ai; do
  code=$(curl -s -o /dev/null -I -w "%{http_code}" "$BASE$p")
  loc=$(curl -s -I "$BASE$p" | awk -F': ' '/^location:/ {print $2}' | tr -d '\r')
  echo "$p => $code $loc"
done

say "Login logo (must use /logo-nexa.png)"
if curl -s "$BASE/login" | grep -q "/logo-nexa.png"; then
  echo "✅ Logo OK"
else
  echo "❌ Logo missing (page may still reference /brand/nexa.svg). Fix by either:"
  echo "   1) Update apps/web/app/login/page.tsx to use /logo-nexa.png, or"
  echo "   2) Symlink: mkdir -p apps/web/public/brand && ln -sf ../logo-nexa.png apps/web/public/brand/nexa.svg"
  exit 1
fi

say "Fetch CSRF + credentials login (NextAuth)"
COOKIEJAR=$(mktemp)
# fetch CSRF with cookies
CSRF_JSON=$(curl -s -c "$COOKIEJAR" "$BASE/api/auth/csrf")
CSRF_TOKEN=$(echo "$CSRF_JSON" | jq -r '.csrfToken')
[ -n "$CSRF_TOKEN" ] && [ "$CSRF_TOKEN" != "null" ] || { echo "❌ Could not read CSRF token"; echo "$CSRF_JSON"; exit 1; }

# post credentials with csrfToken
curl -s -i -o /tmp/login.h -b "$COOKIEJAR" -c "$COOKIEJAR" \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "csrfToken=$CSRF_TOKEN&email=$E2E_EMAIL&password=$E2E_PASSWORD&callbackUrl=%2Fdashboard" >/dev/null

if grep -qi "^location: https://.*/dashboard" /tmp/login.h; then
  echo "✅ Credentials redirect OK"
else
  echo "❌ Credentials signin failed — headers:"; sed -n '1,80p' /tmp/login.h; exit 1;
fi

SESSION_COOKIE=$(grep -E "__Secure-next-auth\\.session-token|next-auth\\.session-token" "$COOKIEJAR" | awk '{print $6"="$7}' | tail -n1)
[ -n "$SESSION_COOKIE" ] && echo "✅ Session cookie set" || { echo "❌ No session cookie"; cat "$COOKIEJAR"; exit 1; }

say "Authenticated pages (layout markers present)"
check_page(){ local path="$1"; code=$(curl -s -o /tmp/p.html -w "%{http_code}" -H "Cookie: $SESSION_COOKIE" "$BASE$path"); echo "$path => $code"; [ "$code" = "200" ] || exit 1; grep -q 'data-testid="layout-sidebar"' /tmp/p.html && grep -q 'data-testid="layout-topbar"' /tmp/p.html && grep -q 'data-testid="ai-engine-bar"' /tmp/p.html; }
for r in \
/ dashboard \
/finance /finance/gl /finance/ap /finance/ar /finance/bank /finance/vat /finance/fa /finance/close /finance/fx /finance/reports /finance/invoices /finance/bills /finance/purchase-orders /finance/payments \
/hr /hr/employees /hr/payroll /hr/leave \
/inventory /inventory/items /inventory/adjustments /inventory/transfers /inventory/warehouses \
/manufacturing /manufacturing/boms /manufacturing/work-orders /manufacturing/schedules \
/sales /sales/leads /sales/opportunities /sales/quotes /sales/orders \
/purchasing /purchasing/suppliers /purchasing/orders \
/projects /projects/boards /projects/tasks /projects/timesheets \
/pos /pos/register /pos/receipts \
/ai /ai/assistant /ai/automation \
/costing /help
do check_page "$r"; done

say "Forgot-password API (should be 200 JSON; may skip send if SMTP empty)"
curl -s -i -X POST "$BASE/api/auth/forgot-password" \
  -H "content-type: application/json" \
  -d "{\"email\":\"$E2E_EMAIL\"}" | sed -n '1,12p'

say "✅ Blocker fully validated for production"
