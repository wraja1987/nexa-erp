#!/usr/bin/env bash
set -euo pipefail

# PLAN: A) Sanity, B) Preview-safe NextAuth, C) Vercel Preview envs, D) Clean preview deploy, E) Optional budget bump

ROOT="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
APP="$ROOT/apps/web"
LP="$APP/app/(auth)/login/page.tsx"
AR="$APP/app/api/auth/[...nextauth]/route.ts"
MW="$APP/middleware.ts"

step() { echo; echo "=== $*"; }
run() { echo "> RUN: $*"; eval "$@"; }

### A) Local sanity ###
step "A1) Repo state"
run "cd \"$ROOT\" && git rev-parse --abbrev-ref HEAD && git log -3 --oneline"

step "A2) Sanity markers in login/auth/middleware"
test -f "$LP" && test -f "$AR" && test -f "$MW"
run "grep -F '"use client"' \"$LP\""
run "grep -F 'fetch("/api/auth/csrf", { credentials: "include"' \"$LP\""
run "grep -F 'useRef' \"$LP\""
run "grep -F 'action="/api/auth/callback/credentials"' \"$LP\""
run "grep -F 'name="csrfToken"' \"$LP\""
run "grep -F 'name="callbackUrl"' \"$LP\""

run "grep -F 'trustHost: true' \"$AR\""
run "grep -F 'session: { strategy: "jwt" }' \"$AR\""
run "grep -F 'signIn: "/login"' \"$AR\""
run "grep -F 'const handler = NextAuth' \"$AR\""
run "grep -F 'export { handler as GET, handler as POST }' \"$AR\""
if grep -q "cookies:" "$AR"; then echo "ERROR: cookies override present"; exit 1; fi
if grep -q "process.env.NEXTAUTH_URL" "$AR"; then echo "ERROR: NEXTAUTH_URL ref present"; exit 1; fi

run "grep -F 'getToken' \"$MW\""
run "grep -F 'matcher:' \"$MW\""
run "grep -F '"/login"' \"$MW\""
run "grep -F '"/api/auth"' \"$MW\""
run "grep -F 'icons' \"$MW\""
run "grep -F 'images' \"$MW\""
run "grep -F 'favicon.ico' \"$MW\""

step "A3) Local build"
run "cd \"$APP\" && pnpm clean || true"
run "cd \"$APP\" && pnpm build"

step "A4) Local auth smoke on :3001"
run "lsof -ti :3001 | xargs kill 2>/dev/null || true"
run "cd \"$APP\" && pnpm dev -p 3001 > /tmp/nexa-preview.log 2>&1 & echo $! > /tmp/nexa-preview.pid"
for i in {1..60}; do CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/login || true); [ "$CODE" = "200" ] && break; sleep 0.5; done
echo "Dev on :3001 (code=${CODE:-})"
test "${CODE:-}" = "200"

echo "-- Providers"
run "curl -s http://localhost:3001/api/auth/providers | sed 's/","/",\n  "/g'"

echo "-- CSRF headers"
run "curl -s -i http://localhost:3001/api/auth/csrf | sed -n '1,20p' | sed -E 's/(next-auth\.[^;]+);.*/\1 .../g'"

CJ="/tmp/nexa-preview-cookie.txt"; rm -f "$CJ"
run "curl -s -c \"$CJ\" http://localhost:3001/api/auth/csrf > /dev/null"
CSRF=$(curl -s -b "$CJ" http://localhost:3001/api/auth/csrf | jq -r .csrfToken)
[ -n "$CSRF" ] && [ "$CSRF" != "null" ] || { echo "ERROR: No CSRF token"; exit 1; }
echo "CSRF_PREFIX=${CSRF:0:8}"

echo "-- Credentials login"
run "curl -i -s -b \"$CJ\" -c \"$CJ\" -X POST http://localhost:3001/api/auth/callback/credentials -H 'content-type: application/x-www-form-urlencoded' --data-urlencode csrfToken=$CSRF --data callbackUrl=%2Fdashboard --data email=superadmin@nexa.local --data password=Test123! | sed -n '1,20p'"

LOC=$(curl -i -s -b "$CJ" -c "$CJ" -X POST http://localhost:3001/api/auth/callback/credentials -H 'content-type: application/x-www-form-urlencoded' --data-urlencode csrfToken=$CSRF --data callbackUrl=%2Fdashboard --data email=superadmin@nexa.local --data password=Test123! | awk '/^[Ll]ocation:/ {print $2}' | tr -d '\r')
echo "Location: $LOC"
case "$LOC" in */dashboard|/dashboard) : ;; *) echo "ERROR: Unexpected redirect: $LOC"; exit 1;; esac

echo "-- Session"
run "curl -s -b \"$CJ\" http://localhost:3001/api/auth/session"

run "lsof -ti :3001 | xargs kill 2>/dev/null || true"

### B) Preview-safe NextAuth ###
step "B5) Ensure no useSecureCookies or NEXTAUTH_URL refs"
if grep -q "useSecureCookies" "$AR"; then echo "ERROR: useSecureCookies present"; exit 1; fi
if grep -q "process.env.NEXTAUTH_URL" "$AR"; then echo "ERROR: NEXTAUTH_URL present"; exit 1; fi

step "B6) Ensure apps/web/.env.example without NEXTAUTH_URL"
cat > "$APP/.env.example" <<'ENV'
NEXTAUTH_SECRET=
AUTH_TRUST_HOST=true
DATABASE_URL=
ENV
run "sed -n '1,20p' \"$APP/.env.example\""

### C) Vercel Preview envs ###
step "C7/C8) Link project and set Preview envs (no NEXTAUTH_URL)"
if ! command -v vercel >/dev/null 2>&1; then echo "ERROR: vercel CLI not installed"; exit 1; fi
cd "$ROOT"
if [ ! -d .vercel ]; then run "vercel link --yes"; fi
SECRET=$(grep -E '^NEXTAUTH_SECRET=' "$APP/.env.local" 2>/dev/null | cut -d= -f2- || true)
DBURL=$(grep -E '^DATABASE_URL=' "$APP/.env.local" 2>/dev/null | cut -d= -f2- || true)
[ -n "$SECRET" ] || SECRET=devsecret
[ -n "$DBURL" ] || { echo "ERROR: DATABASE_URL missing in apps/web/.env.local"; exit 1; }
run "printf %s \"$SECRET\" | vercel env add NEXTAUTH_SECRET preview --yes"
run "printf %s true | vercel env add AUTH_TRUST_HOST preview --yes"
run "printf %s \"$DBURL\" | vercel env add DATABASE_URL preview --yes"
run "vercel env rm NEXTAUTH_URL preview --yes || true"
run "vercel env rm NEXTAUTH_URL production --yes || true"
run "vercel env ls || true"

### D) Clean preview deployment ###
step "D9) No-op commit to retrigger preview"
cd "$ROOT"
run "git commit --allow-empty -m 'chore(ci): retrigger preview (auth plan)' || true"
BR=$(git rev-parse --abbrev-ref HEAD)
run "git push -u origin \"$BR\""

echo "All steps through D completed. For E) budget bump, run manually after checks conclude."





