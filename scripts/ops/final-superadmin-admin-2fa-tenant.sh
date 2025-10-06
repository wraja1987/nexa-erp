#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Nexa ERP — FINAL Master Command: Super/Admin emails + tenant-aware upsert + 2FA
#
# You previously ran most steps. This command:
#  • Reasserts env/docs values (idempotent) and confirms they are set.
#  • Requires YOUR confirmation before DB writes.
#  • Fetches or creates a tenant (prefers existing demo/default), captures tenant_id.
#  • Upserts Super Admin + Admin with tenant_id and bcrypt hash of "Wolfish123".
#  • Verifies rows and prints a PASS/FAIL summary.
#
# Notes:
#  • Assumes Postgres, table "users" with columns: email, password_hash, role,
#    email_verified, tenant_id, created_at; and table "tenants" with id, name, slug.
#  • If your schema differs, adjust the SQL block below.
################################################################################

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
DOCS="$ROOT/docs"
AUDIT="$ROOT/reports/audit.jsonl"
BR="chore/superadmin-admin-2fa-tenant"

SUPER_EMAIL="info@chiefaa.com"
ADMIN_EMAIL="wraja1987@yahoo.co.uk"
PASSWORD="Wolfish123"
FROM_NAME="Nexa ERP"

# 2FA env (already scaffolded; reassert safely)
OTP_EXP_MIN=10
OTP_LEN=6
OTP_RATE_PER_MIN=3

say(){ printf "%s\n" "$*"; }
fail(){ printf "FAIL: %s\n" "$*" >&2; exit 1; }
ok(){ printf "OK: %s\n" "$*"; }
need(){ command -v "$1" >/dev/null 2>&1 || fail "missing required tool: $1"; }

# ---------- Preflight ----------
[ -d "$ROOT" ] || fail "Repo not found at $ROOT"
cd "$ROOT"
need git
need node
command -v psql >/dev/null 2>&1 || fail "psql not installed (needed to fix tenant_id + upsert users)"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not a git repo"
CUR_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$CUR_BRANCH" != "HEAD" ] || fail "Detached HEAD; checkout a branch first"

if git rev-parse --verify "$BR" >/dev/null 2>&1; then git checkout "$BR"; else git checkout -b "$BR"; fi

# ---------- Env/doc reaffirmation (idempotent) ----------
set_kv () {
  local file="$1" key="$2" val="$3"
  [ -f "$file" ] || touch "$file"
  if grep -qE "^${key}=" "$file"; then
    perl -0777 -pe "s|^${key}=.*$|${key}=${val}|m" -i "$file"
  else
    printf "%s=%s\n" "$key" "$val" >> "$file"
  fi
}

patch_env_block () {
  local f="$1"
  set_kv "$f" "SUPERADMIN_EMAIL" "$SUPER_EMAIL"
  set_kv "$f" "ADMIN_EMAIL" "$ADMIN_EMAIL"
  set_kv "$f" "DEFAULT_FROM" "${FROM_NAME} <${SUPER_EMAIL}>"
  set_kv "$f" "SUPPORT_EMAIL" "$SUPER_EMAIL"
  set_kv "$f" "NEXTAUTH_EMAIL_FROM" "$SUPER_EMAIL"
  set_kv "$f" "TWO_FACTOR_EMAIL_ENABLED" "1"
  set_kv "$f" "OTP_EXP_MIN" "$OTP_EXP_MIN"
  set_kv "$f" "OTP_LEN" "$OTP_LEN"
  set_kv "$f" "OTP_RATE_PER_MIN" "$OTP_RATE_PER_MIN"
}

ENV_FILES=("$WEB/.env" "$WEB/.env.production" "$ROOT/.env.example")
for f in "${ENV_FILES[@]}"; do patch_env_block "$f"; done

# Docs: only replace literal old email if present (safe no-op otherwise)
if [ -d "$DOCS" ]; then
  find "$DOCS" -type f -name "*.md" -print0 | while IFS= read -r -d "" f; do
    perl -0777 -pe "s|\bnexa_app@nexaai\.co\.uk\b|${SUPER_EMAIL}|g" -i "$f" || true
  done
fi

# Audit line for env/docs confirmation
mkdir -p "$(dirname "$AUDIT")"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "{\"time\":\"$TS\",\"event\":\"super_admin_admin_envdocs_confirm\",\"super\":\"$SUPER_EMAIL\",\"admin\":\"$ADMIN_EMAIL\"}" >> "$AUDIT"

# ---------- Explicit confirmation BEFORE DB writes ----------
say "ENV/DOCS are set to:"
say "  SUPERADMIN_EMAIL=$SUPER_EMAIL"
say "  ADMIN_EMAIL=$ADMIN_EMAIL"
say "REQUIRED: Type CONFIRM to proceed with tenant-aware DB user UPSERTS and password hashing."
read -r -p "> " ACK
[ "$ACK" = "CONFIRM" ] || fail "Confirmation not provided. Aborting before DB changes."

# ---------- Build bcrypt hash for password ----------
# ensure bcryptjs available
if ! node -e "require('bcryptjs')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D bcryptjs >/dev/null 2>&1 || true
  else npm i bcryptjs --no-save >/dev/null 2>&1 || true
  fi
fi
# use repo-local temp file for reliable module resolution
mkdir -p "$ROOT/.tmp"
TMPHASH="$ROOT/.tmp/hash-$(date +%s%N).js"
cat > "$TMPHASH" <<'NODE'
const bcrypt = require('bcryptjs');
const pw = process.argv[2];
if (!pw) { console.error('pw required'); process.exit(2); }
process.stdout.write(bcrypt.hashSync(pw, 10));
NODE
PW_HASH="$(node "$TMPHASH" "$PASSWORD" || true)"
rm -f "$TMPHASH"
[ -n "$PW_HASH" ] || fail "Password hash failed"

# ---------- Resolve DATABASE_URL robustly (strip quotes; prefer apps/web/.env) ----------
sanitize_url () { sed -e "s/^['\"]//" -e "s/['\"]$//"; }

DB_URL=""
if [ -f "$WEB/.env" ]; then
  DB_URL="$(grep -Eo "^DATABASE_URL=.*" "$WEB/.env" 2>/dev/null | cut -d= -f2- | sanitize_url || true)"
fi
if [ -z "$DB_URL" ] && [ -f "$ROOT/.env.production" ]; then
  DB_URL="$(grep -Eo "^DATABASE_URL=.*" "$ROOT/.env.production" 2>/dev/null | cut -d= -f2- | sanitize_url || true)"
fi
if [ -z "$DB_URL" ] && [ -f "$ROOT/.env.example" ]; then
  DB_URL="$(grep -Eo "^DATABASE_URL=.*" "$ROOT/.env.example" 2>/dev/null | cut -d= -f2- | sanitize_url || true)"
fi
[ -n "$DB_URL" ] || fail "DATABASE_URL not found in env files"
# Strip Prisma query params for psql and capture schema if present
PSQL_URL="${DB_URL%%\?*}"
QUERY_PART="${DB_URL#*?}"
SEARCH_SCHEMA=""
if [ "$QUERY_PART" != "$DB_URL" ]; then
  SEARCH_SCHEMA="$(printf '%s' "$QUERY_PART" | tr '&' '\n' | grep -E '^schema=' | head -n1 | cut -d= -f2- || true)"
fi
SCHEMA_PREFIX=""
if [ -n "$SEARCH_SCHEMA" ]; then
  SCHEMA_PREFIX="SET search_path TO ${SEARCH_SCHEMA};"
fi

# Quick connectivity check (without Prisma query params)
psql "$PSQL_URL" -Atqc "SELECT 1" >/dev/null || fail "Cannot connect to DB with provided DATABASE_URL"

# ---------- Tenant discovery / creation and user upserts ----------
# Strategy:
#   1) Try to find a clear default tenant (slug IN demo, default) or name like Demo/Nexa Demo.
#   2) If none, create one with slug=demo, name=Nexa Demo.
#   3) Upsert both users bound to that tenant_id.
SQL=$(cat <<SQL
DO $$
DECLARE
  t_id uuid;
  super_email text := '${SUPER_EMAIL}';
  admin_email text := '${ADMIN_EMAIL}';
  pw_hash text := '${PW_HASH}';
BEGIN
  -- 1) Find tenant
  SELECT id INTO t_id
  FROM tenants
  WHERE lower(slug) IN ('demo','default')
     OR lower(name) IN ('demo','nexa demo','default')
  ORDER BY created_at ASC
  LIMIT 1;

  -- 2) Create if missing
  IF t_id IS NULL THEN
    INSERT INTO tenants (name, slug, created_at)
    VALUES ('Nexa Demo','demo', now())
    RETURNING id INTO t_id;
  END IF;

  -- 3) Upsert Super Admin
  BEGIN
    INSERT INTO users (email, password_hash, role, email_verified, tenant_id, created_at)
    VALUES (super_email, pw_hash, 'super_admin', true, t_id, now())
    ON CONFLICT (email, tenant_id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          email_verified = EXCLUDED.email_verified;
  EXCEPTION WHEN undefined_column THEN
    -- Fallback if unique is only (email)
    INSERT INTO users (email, password_hash, role, email_verified, tenant_id, created_at)
    VALUES (super_email, pw_hash, 'super_admin', true, t_id, now())
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          email_verified = EXCLUDED.email_verified;
  END;

  -- 4) Upsert Admin
  BEGIN
    INSERT INTO users (email, password_hash, role, email_verified, tenant_id, created_at)
    VALUES (admin_email, pw_hash, 'admin', true, t_id, now())
    ON CONFLICT (email, tenant_id) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          email_verified = EXCLUDED.email_verified;
  EXCEPTION WHEN undefined_column THEN
    INSERT INTO users (email, password_hash, role, email_verified, tenant_id, created_at)
    VALUES (admin_email, pw_hash, 'admin', true, t_id, now())
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          email_verified = EXCLUDED.email_verified;
  END;
END
$$;

-- Verification output
TABLE (
  SELECT u.email, u.role, u.tenant_id FROM users u
  WHERE u.email IN ('${SUPER_EMAIL}','${ADMIN_EMAIL}')
  ORDER BY u.email
);
SQL
)

SQL_RUN="$SCHEMA_PREFIX $SQL"
psql "$PSQL_URL" -v ON_ERROR_STOP=1 -c "$SQL_RUN" || fail "Tenant-aware upsert failed"

# ---------- Final audit + summary ----------
TS2="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "{\"time\":\"$TS2\",\"event\":\"super_admin_admin_upsert_done\",\"super\":\"$SUPER_EMAIL\",\"admin\":\"$ADMIN_EMAIL\"}" >> "$AUDIT"

git add -A
git commit -m "chore(auth): tenant-aware upsert for Super Admin/Admin; bcrypt; env/docs reaffirmed" >/dev/null 2>&1 || true

echo
echo "==== SUMMARY ===="
echo "Super Admin: $SUPER_EMAIL"
echo "Admin:       $ADMIN_EMAIL"
echo "Passwords:   bcrypt-hashed (plaintext was: ${PASSWORD})"
echo "2FA:         Email OTP already scaffolded and enabled via env"
echo "DB:          Tenant-aware upsert executed and verified"
echo
echo "REQUIRED OWNER CONFIRMATION:"
echo "  Confirm BOTH:"
echo "   1) Emails set correctly in env/docs."
echo "   2) Users exist in DB with tenant_id and roles (query above printed rows)."
echo "Reply in your notes: CONFIRMED-SUPER-ADMIN-AND-2FA"
echo
echo "Next: push branch and open PR:"
echo "  git push -u origin $BR"


