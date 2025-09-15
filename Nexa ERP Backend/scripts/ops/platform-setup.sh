#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${ROOT:-$HOME/Desktop/Business Opportunities/Nexa ERP}"
BACKEND="$ROOT/Nexa ERP Backend"
DEP="$BACKEND/deploy"
DOCKER="$DEP/docker"
ENV_EX="$DEP/.env.example"
ENV_OUT="$DEP/.env"
MIG="$BACKEND/scripts/ops/prisma-migrate.sh"

[ -f "$ENV_EX" ] || { echo "[fatal] Missing $ENV_EX"; exit 1; }

echo "== Nexa ERP — One-off Platform Setup =="

# A) Domains/DNS — prompt desired VPS IP and check current A records
read -r -p "Your VPS public IPv4 (for app.nexaai.co.uk & api.nexaai.co.uk): " VPS_IP
APP_HOST="app.nexaai.co.uk"
API_HOST="api.nexaai.co.uk"

check_dns() {
  local host="$1"
  local current
  if command -v dig >/dev/null 2>&1; then
    current="$(dig +short A "$host" | tail -n1)"
  else
    current="$(host "$host" 2>/dev/null | awk "/has address/ {print $4}" | tail -n1)"
  fi
  echo "$current"
}

echo "[info] Checking DNS A records…"
CUR_APP="$(check_dns "$APP_HOST" || true)"
CUR_API="$(check_dns "$API_HOST" || true)"
echo "  $APP_HOST -> ${CUR_APP:-<none>}"
echo "  $API_HOST -> ${CUR_API:-<none>}"
if [ -n "$VPS_IP" ]; then
  [ "$CUR_APP" = "$VPS_IP" ] && echo "  ✓ $APP_HOST points to $VPS_IP" || echo "  ⚠ $APP_HOST should point to $VPS_IP (update at your DNS/Hostinger)."
  [ "$CUR_API" = "$VPS_IP" ] && echo "  ✓ $API_HOST points to $VPS_IP" || echo "  ⚠ $API_HOST should point to $VPS_IP (update at your DNS/Hostinger)."
fi
echo

# B) TLS/Proxy — ensure Caddyfile has correct domains (idempotent replace)
CF="$DOCKER/Caddyfile"
if [ -f "$CF" ]; then
  sed -i.bak "s/^app\.nexaai\.co\.uk.*/app.nexaai.co.uk {/" "$CF" || true
  sed -i.bak "s/^api\.nexaai\.co\.uk.*/api.nexaai.co.uk {/" "$CF" || true
  echo "[ok] Caddyfile present at $CF (domains ensured)."
else
  cat > "$CF" <<CAD
{
  email admin@nexaai.co.uk
}
nexaai.co.uk, www.nexaai.co.uk {
  root * /var/www/html
  file_server
}
app.nexaai.co.uk {
  reverse_proxy api:3001
}
api.nexaai.co.uk {
  reverse_proxy api:3001
}
CAD
  echo "[ok] Created default Caddyfile at $CF"
fi
echo

# C) Database & Redis URLs — prompt and validate format
copy_from_example() { cp "$ENV_EX" "$ENV_OUT"; }

echo "[info] Creating $ENV_OUT from template…"
copy_from_example
echo "[ok] Wrote $ENV_OUT"

read -r -p "DATABASE_URL (postgres://user:pass@host:5432/nexa?sslmode=require): " DB_URL
read -r -p "REDIS_URL (redis://:pass@host:6379): " REDIS_URL
[ -z "$DB_URL" ] && { echo "[fatal] DATABASE_URL is required"; exit 1; }
[ -z "$REDIS_URL" ] && { echo "[fatal] REDIS_URL is required"; exit 1; }

# D) Environment security — generate secrets if blank
read -r -p "NEXTAUTH_URL (default https://app.nexaai.co.uk): " NEXTAUTH_URL
NEXTAUTH_URL="${NEXTAUTH_URL:-https://app.nexaai.co.uk}"

read -r -p "NEXTAUTH_SECRET (64 chars; leave blank to auto-generate): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
  NEXTAUTH_SECRET="$(openssl rand -base64 48 | tr -d "\n" | cut -c1-64)"
  echo "[ok] Generated NEXTAUTH_SECRET"
fi

read -r -p "ENCRYPTION_KEY (Base64 32 bytes; leave blank to auto-generate): " ENCRYPTION_KEY
if [ -z "$ENCRYPTION_KEY" ]; then
  ENCRYPTION_KEY="$(openssl rand -base64 32 | tr -d "\n")"
  echo "[ok] Generated ENCRYPTION_KEY"
fi

# Write/replace keys in .env
kv() { k="$1"; v="$2"; if grep -q "^$k=" "$ENV_OUT"; then sed -i.bak "s|^$k=.*|$k=$v|" "$ENV_OUT"; else echo "$k=$v" >> "$ENV_OUT"; fi; }
kv DATABASE_URL "$DB_URL"
kv REDIS_URL "$REDIS_URL"
kv NEXTAUTH_URL "$NEXTAUTH_URL"
kv NEXTAUTH_SECRET "$NEXTAUTH_SECRET"
kv ENCRYPTION_KEY "$ENCRYPTION_KEY"

echo
echo "[ok] .env updated at $ENV_OUT"
echo

# E) Migrations — run Prisma migrations via provided helper
if [ -x "$MIG" ]; then
  echo "[info] Running Prisma migrations…"
  "$MIG" "$ENV_OUT"
  echo "[ok] Prisma migrations applied."
else
  echo "[warn] Migration script not executable at $MIG — fixing perms and retrying…"
  chmod +x "$MIG"
  "$MIG" "$ENV_OUT"
  echo "[ok] Prisma migrations applied."
fi

# Final summary
echo
echo "== Summary =="
echo "  VPS IP target        : ${VPS_IP:-(not provided)}"
echo "  DNS (check/update)   : app.nexaai.co.uk, api.nexaai.co.uk -> $VPS_IP"
echo "  Caddyfile            : $DOCKER/Caddyfile"
echo "  .env                 : $ENV_OUT"
echo "  Prisma migrations    : applied"
echo
echo "[next] Point A records at your DNS host to $VPS_IP, then bring up Docker or PM2 per the deploy bundle."
