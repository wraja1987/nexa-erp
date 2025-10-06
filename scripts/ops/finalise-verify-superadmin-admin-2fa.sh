#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
BR="chore/superadmin-admin-2fa-tenant"

SUPER="info@chiefaa.com"
ADMIN="wraja1987@yahoo.co.uk"
PLAINTEXT_PW="Wolfish123"
PORT="${PORT:-3010}"

need(){ command -v "$1" >/dev/null 2>&1 || { echo "missing: $1"; exit 1; }; }
need git; need node; need psql; command -v pnpm >/dev/null 2>&1 || true
[ -d "$ROOT" ] || { echo "repo not found at $ROOT"; exit 1; }
cd "$ROOT"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "not a git repo"; exit 1; }
CUR="$(git rev-parse --abbrev-ref HEAD)"; [ "$CUR" != "HEAD" ] || { echo "detached HEAD"; exit 1; }

git rev-parse --verify "$BR" >/dev/null 2>&1 && git checkout "$BR" || git checkout -b "$BR"

# 1) Redis up
if ! grep -qE '^REDIS_URL=' "$WEB/.env" 2>/dev/null; then
  echo "REDIS_URL=redis://127.0.0.1:6379" >> "$WEB/.env"
fi
if ! (redis-cli -u "$(grep -Eo '^REDIS_URL=.*' "$WEB/.env" | cut -d= -f2-)" PING >/dev/null 2>&1); then
  docker rm -f nexa-redis >/dev/null 2>&1 || true
  docker run -d --name nexa-redis -p 6379:6379 redis:7-alpine >/dev/null
fi

# 2) DB URL
DB_URL="$(grep -Eo '^DATABASE_URL=.*' "$WEB/.env" 2>/dev/null | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//")"
[ -n "$DB_URL" ] || { echo "DATABASE_URL missing in $WEB/.env"; exit 1; }
psql "$DB_URL" -Atqc "select 1" >/dev/null

# 3) Ensure tables/indexes
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tenants') THEN
    CREATE TABLE tenants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      slug text UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL,
      email_verified boolean NOT NULL DEFAULT false,
      tenant_id uuid REFERENCES tenants(id),
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX users_email_tenant_uidx ON users(email, tenant_id);
  ELSE
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='users_email_tenant_uidx') THEN
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_tenant_uidx ON users(email, tenant_id);
    END IF;
  END IF;
END$$;

WITH chosen AS (
  SELECT id FROM tenants
  WHERE lower(coalesce(slug,'')) IN ('demo','default') OR lower(name) IN ('nexa demo','demo','default')
  ORDER BY created_at ASC LIMIT 1
), created AS (
  INSERT INTO tenants(name, slug)
  SELECT 'Nexa Demo','demo'
  WHERE NOT EXISTS (SELECT 1 FROM chosen)
  RETURNING id
)
SELECT coalesce((SELECT id FROM chosen),(SELECT id FROM created)) AS tenant_id;
SQL

# 4) Bcrypt hash
if ! node -e "require('bcryptjs')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D bcryptjs >/dev/null 2>&1 || true; else npm i bcryptjs --no-save >/dev/null 2>&1 || true; fi
fi
PW_HASH=$(node -e "const b=require('bcryptjs'); console.log(b.hashSync(process.env.PW||'${PLAINTEXT_PW}',10));")
[ -n "$PW_HASH" ] || { echo "hash failed"; exit 1; }

# 5) Tenant-aware upsert
psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
  t_id uuid;
BEGIN
  SELECT id INTO t_id FROM tenants
  WHERE lower(coalesce(slug,'')) IN ('demo','default') OR lower(name) IN ('nexa demo','demo','default')
  ORDER BY created_at ASC LIMIT 1;

  IF t_id IS NULL THEN
    INSERT INTO tenants(name, slug) VALUES ('Nexa Demo','demo') RETURNING id INTO t_id;
  END IF;

  BEGIN
    INSERT INTO users(email, password_hash, role, email_verified, tenant_id, active)
    VALUES ('${SUPER}', '${PW_HASH}', 'super_admin', true, t_id, true)
    ON CONFLICT (email, tenant_id) DO UPDATE
      SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, email_verified=EXCLUDED.email_verified, active=true;
  EXCEPTION WHEN unique_violation THEN
    UPDATE users SET password_hash='${PW_HASH}', role='super_admin', email_verified=true, active=true, tenant_id=t_id WHERE email='${SUPER}';
  END;

  BEGIN
    INSERT INTO users(email, password_hash, role, email_verified, tenant_id, active)
    VALUES ('${ADMIN}', '${PW_HASH}', 'admin', true, t_id, true)
    ON CONFLICT (email, tenant_id) DO UPDATE
      SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, email_verified=EXCLUDED.email_verified, active=true;
  EXCEPTION WHEN unique_violation THEN
    UPDATE users SET password_hash='${PW_HASH}', role='admin', email_verified=true, active=true, tenant_id=t_id WHERE email='${ADMIN}';
  END;
END$$;

SELECT email, role, tenant_id, active FROM users WHERE email IN ('${SUPER}','${ADMIN}') ORDER BY email;
SQL

# 6) Start dev server on PORT
cd "$WEB"
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "dev already running on :$PORT"
else
  if command -v pnpm >/dev/null 2>&1; then (PORT="$PORT" pnpm next dev >/tmp/nexa-dev.log 2>&1 &) ; else (PORT="$PORT" npm run dev >/tmp/nexa-dev.log 2>&1 &) ; fi
  for i in $(seq 1 40); do curl -fsS "http://127.0.0.1:$PORT/login" >/dev/null 2>&1 && break || sleep 0.5; done
fi

# 7) OTP request
set +e
HTTP=$(curl -s -o /tmp/otp.json -w "%{http_code}" -X POST "http://127.0.0.1:$PORT/api/otp/request" \
  -H "Content-Type: application/json" --data "{\"email\":\"$SUPER\"}")
set -e

echo "---- SUMMARY ----"
echo "Users in DB:"
psql "$DB_URL" -c "SELECT email, role, tenant_id, active FROM users WHERE email IN ('$SUPER','$ADMIN') ORDER BY email;"
echo
echo "OTP request HTTP code: $HTTP (200 means OK). Response body:"
cat /tmp/otp.json || true
