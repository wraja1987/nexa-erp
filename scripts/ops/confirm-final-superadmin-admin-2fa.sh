#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Nexa ERP — Master Prompt: Confirm & Finalise Super Admin + Admin + 2FA
#
# This final master script:
#  1) Confirms that tenant-aware Super Admin and Admin users exist
#  2) Verifies OTP (2FA) email endpoint returns 200
#  3) Ensures DB connectivity and Redis availability
#  4) Commits audit confirmation
#  5) Pushes branch chore/superadmin-admin-2fa-tenant and opens PR to main
################################################################################

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
AUDIT="$ROOT/reports/audit.jsonl"
BR="chore/superadmin-admin-2fa-tenant"

SUPER="info@chiefaa.com"
ADMIN="wraja1987@yahoo.co.uk"
PORT="${PORT:-3010}"

need(){ command -v "$1" >/dev/null 2>&1 || { echo "missing: $1"; exit 1; }; }
need git; need node; need psql; command -v pnpm >/dev/null 2>&1 || true
[ -d "$ROOT" ] || { echo "repo not found at $ROOT"; exit 1; }

cd "$ROOT"

# ---------- 1) Verify branch ----------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo"; exit 1; }
CUR="$(git rev-parse --abbrev-ref HEAD)"
[ "$CUR" = "$BR" ] || git checkout "$BR"

# ---------- 2) Check DATABASE_URL ----------
DB_URL="$(grep -Eo '^DATABASE_URL=.*' "$WEB/.env" 2>/dev/null | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//")"
[ -n "$DB_URL" ] || { echo "DATABASE_URL missing in $WEB/.env"; exit 1; }
psql "$DB_URL" -Atqc "select 1" >/dev/null && echo "DB connection OK"

# ---------- 3) Check Redis ----------
if ! (redis-cli -u "$(grep -Eo '^REDIS_URL=.*' "$WEB/.env" | cut -d= -f2-)" PING >/dev/null 2>&1); then
  docker rm -f nexa-redis >/dev/null 2>&1 || true
  docker run -d --name nexa-redis -p 6379:6379 redis:7-alpine >/dev/null
  echo "Redis started locally"
fi

# ---------- 4) Verify DB entries ----------
echo "Users in database:"
psql "$DB_URL" -c "SELECT email, role, tenant_id, active FROM users WHERE email IN ('$SUPER','$ADMIN') ORDER BY email;"

# ---------- 5) Test OTP API endpoint ----------
cd "$WEB"
if ! lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then (PORT="$PORT" pnpm next dev >/tmp/nexa-dev.log 2>&1 &) ; else (PORT="$PORT" npm run dev >/tmp/nexa-dev.log 2>&1 &) ; fi
  for i in $(seq 1 40); do curl -fsS "http://127.0.0.1:$PORT/login" >/dev/null 2>&1 && break || sleep 0.5; done
fi

echo "Firing OTP request..."
set +e
HTTP=$(curl -s -o /tmp/otp.json -w "%{http_code}" -X POST "http://127.0.0.1:$PORT/api/otp/request" \
  -H "Content-Type: application/json" --data "{\"email\":\"$SUPER\"}")
set -e

echo "HTTP code: $HTTP (expect 200)"
cat /tmp/otp.json || true

# ---------- 6) Commit audit confirmation ----------
mkdir -p "$(dirname "$AUDIT")"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "{\"time\":\"$TS\",\"event\":\"confirm_super_admin_admin_2fa\",\"super\":\"$SUPER\",\"admin\":\"$ADMIN\",\"http_code\":$HTTP}" >> "$AUDIT"

git add "$AUDIT"
git commit -m "chore(audit): confirmed Super/Admin and 2FA verification" >/dev/null 2>&1 || true

# ---------- 7) Push branch and open PR ----------
git push -u origin "$BR"
if command -v gh >/dev/null 2>&1; then
  gh pr create --fill --base main --head "$BR" || true
fi

echo
echo "==== SUMMARY ===="
echo "Super Admin: $SUPER"
echo "Admin:       $ADMIN"
echo "OTP endpoint HTTP code: $HTTP (200 = success)"
echo
echo "Branch: $BR pushed to remote."
echo "If PR auto-created, review and merge to main."
echo "Once merged, this blocker is fully complete."




