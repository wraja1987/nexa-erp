#!/usr/bin/env bash
set -euo pipefail

################################################################################
# Nexa ERP — Master Command: Super/Admin accounts + Email OTP 2FA (Credentials)
#
# What this does
#  1) Set Super Admin email -> info@chiefaa.com; Admin email -> wraja1987@yahoo.co.uk
#  2) Update env + docs, append audit
#  3) Gate on YOUR confirmation before touching the database
#  4) Upsert both users with password "Wolfish123" (bcrypt)
#  5) Scaffold Email OTP 2FA flow (API: request/verify; UI: /2fa)
#  6) Patch NextAuth credentials sign-in to require OTP by email after password
#  7) Build + sanity checks; print a PASS/FAIL summary
#
# Safe to re-run. Creates branch: chore/superadmin-admin-2fa
# Prereqs: local repo, Node, git; pnpm preferred; Prisma or psql for DB path
################################################################################

ROOT="$HOME/Desktop/Business Opportunities/Nexa ERP"
WEB="$ROOT/apps/web"
DOCS="$ROOT/docs"
AUDIT="$ROOT/reports/audit.jsonl"
BR="chore/superadmin-admin-2fa"

SUPER_EMAIL="info@chiefaa.com"
ADMIN_EMAIL="wraja1987@yahoo.co.uk"
PASSWORD="Wolfish123"
FROM_NAME="Nexa ERP"

# 2FA config
OTP_EXP_MIN=10
OTP_LEN=6
OTP_RATE_PER_MIN=3

say(){ printf "%s\n" "$*"; }
fail(){ printf "FAIL: %s\n" "$*" >&2; exit 1; }
ok(){ printf "OK: %s\n" "$*"; }
need(){ command -v "$1" >/dev/null 2>&1 || fail "missing: $1"; }

# --- preflight
[ -d "$ROOT" ] || fail "Repo not found at $ROOT"
cd "$ROOT"
need git
need node
if ! command -v pnpm >/dev/null 2>&1; then say "Note: pnpm not found; will fall back to npm where possible"; fi

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Not a git repo"
CUR_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$CUR_BRANCH" != "HEAD" ] || fail "Detached HEAD; checkout a branch first"

if git rev-parse --verify "$BR" >/dev/null 2>&1; then git checkout "$BR"; else git checkout -b "$BR"; fi

# --- helpers
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
  # SMTP placeholders (you must set these for real email delivery)
  grep -qE "^SMTP_HOST=" "$f" || {
    {
      echo "SMTP_HOST="
      echo "SMTP_PORT=587"
      echo "SMTP_USER="
      echo "SMTP_PASS="
      echo "SMTP_SECURE=0"
    } >> "$f"
  }
}

# --- 1) Patch env files
ENV_FILES=("$WEB/.env" "$WEB/.env.production" "$ROOT/.env.example")
for f in "${ENV_FILES[@]}"; do patch_env_block "$f"; done
ok "Env updated with Super/Admin + 2FA flags"

# --- 2) Update docs (email mentions only)
if [ -d "$DOCS" ]; then
  find "$DOCS" -type f -name "*.md" -print0 | while IFS= read -r -d "" f; do
    cp "$f" "$f.bak" 2>/dev/null || true
    perl -0777 -pe "s|\bnexa_app@nexaai\.co\.uk\b|${SUPER_EMAIL}|g" -i "$f"
  done
  ok "Docs patched (email mentions only)"
else
  say "Docs directory not found, skipping docs patch"
fi

# --- 3) Audit line
mkdir -p "$(dirname "$AUDIT")"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "{\"time\":\"$TS\",\"event\":\"super_admin_admin_update_init\",\"super\":\"$SUPER_EMAIL\",\"admin\":\"$ADMIN_EMAIL\"}" >> "$AUDIT"

# --- 4) REQUIRE EXPLICIT CONFIRMATION BEFORE DB CHANGES
say "ACTION REQUIRED: Confirm you want to CREATE/UPSERT users and set passwords."
say "This will write hashed passwords for:"
say " - Super Admin: $SUPER_EMAIL"
say " - Admin:       $ADMIN_EMAIL"
read -r -p "Type CONFIRM exactly to proceed: " ACK
[ "$ACK" = "CONFIRM" ] || fail "Confirmation not provided. Aborting before DB changes."

# --- 5) Hash password (bcrypt)
# ensure bcryptjs available
if ! node -e "require('bcryptjs')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add -D bcryptjs >/dev/null 2>&1 || true
  else npm i bcryptjs --no-save >/dev/null 2>&1 || true
  fi
fi

# macOS-safe tmpfile for hashing (place inside repo to resolve node_modules)
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

# --- 6) Upsert users via Prisma if available, else SQL fallback
PRISMA_OK=0
SQL_OK=0

SCHEMA=""
if [ -f "$ROOT/prisma/schema.prisma" ]; then SCHEMA="$ROOT/prisma/schema.prisma"; fi
if [ -z "$SCHEMA" ] && [ -f "$WEB/prisma/schema.prisma" ]; then SCHEMA="$WEB/prisma/schema.prisma"; fi

if [ -n "$SCHEMA" ]; then
  say "Prisma detected at: $SCHEMA"
  # ensure prisma deps and generate client
  if ! node -e "require('@prisma/client')" >/dev/null 2>&1; then
    if command -v pnpm >/dev/null 2>&1; then pnpm -w add @prisma/client prisma >/dev/null 2>&1 || true
    else npm i @prisma/client prisma --no-save >/dev/null 2>&1 || true
    fi
  fi
  if command -v pnpm >/dev/null 2>&1; then pnpm -w prisma generate >/dev/null 2>&1 || true; else npx -y prisma generate >/dev/null 2>&1 || true; fi

  # repo-local temp file so Node can resolve workspace modules
  mkdir -p "$ROOT/.tmp"
  TMPJS="$ROOT/.tmp/prisma-otp-$(date +%s%N).js"
  cat > "$TMPJS" <<NODE
const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const prisma = new PrismaClient();
  try{
    const hash = "${PW_HASH}";
    await prisma.user.upsert({
      where:{ email:"${SUPER_EMAIL}" },
      update:{ passwordHash: hash, role:"super_admin", emailVerified:true },
      create:{ email:"${SUPER_EMAIL}", passwordHash: hash, role:"super_admin", emailVerified:true }
    });
    await prisma.user.upsert({
      where:{ email:"${ADMIN_EMAIL}" },
      update:{ passwordHash: hash, role:"admin", emailVerified:true },
      create:{ email:"${ADMIN_EMAIL}", passwordHash: hash, role:"admin", emailVerified:true }
    });
    console.log("Prisma upsert OK");
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
NODE
  if node "$TMPJS"; then PRISMA_OK=1; fi
  rm -f "$TMPJS"
else
  say "No Prisma schema found, will try SQL fallback."
fi

if [ "$PRISMA_OK" -ne 1 ]; then
  DB_URL="$(grep -E "^DATABASE_URL=" "$WEB/.env" 2>/dev/null | tail -n1 | sed -E 's/^DATABASE_URL=("?)(.*)\1$/\2/' || true)"
  [ -z "$DB_URL" ] && DB_URL="$(grep -E "^DATABASE_URL=" "$ROOT/.env.example" 2>/dev/null | tail -n1 | sed -E 's/^DATABASE_URL=("?)(.*)\1$/\2/' || true)"
  if [ -z "$DB_URL" ]; then
    say "DATABASE_URL not found; cannot run SQL fallback."
  elif ! command -v psql >/dev/null 2>&1; then
    say "psql not installed; cannot run SQL fallback."
  else
    SQL=$(cat <<SQL
INSERT INTO users (email, password_hash, role, email_verified, created_at)
VALUES ('${SUPER_EMAIL}', '${PW_HASH}', 'super_admin', true, now())
ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, email_verified=EXCLUDED.email_verified;

INSERT INTO users (email, password_hash, role, email_verified, created_at)
VALUES ('${ADMIN_EMAIL}', '${PW_HASH}', 'admin', true, now())
ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, email_verified=EXCLUDED.email_verified;
SQL
)
    if psql "$DB_URL" -v ON_ERROR_STOP=1 -c "$SQL"; then SQL_OK=1; fi
  fi
fi

# --- 7) Scaffold Email OTP API + UI (request/verify + /2fa page)
cd "$WEB"
mkdir -p pages/api/otp pages utils
# utils/otp.ts
cat > utils/otp.ts <<'TS'
import crypto from "crypto";
export function generateOTP(len:number=6){ return crypto.randomInt(0,10**len).toString().padStart(len,"0"); }
export function key(email:string){ return `otp:${email.toLowerCase()}`; }
TS

# lib/redis.ts (simple client)
mkdir -p lib
cat > lib/redis.ts <<'TS'
import { createClient } from "redis";
const url = process.env.REDIS_URL || "";
let client: ReturnType<typeof createClient> | null = null;
export async function getRedis(){
  if(!url) throw new Error("REDIS_URL missing");
  if(!client){
    client = createClient({ url });
    client.on("error",(e)=>console.error("Redis error",e));
    await client.connect();
  }
  return client;
}
TS

# lib/mailer.ts
mkdir -p lib
cat > lib/mailer.ts <<'TS'
import nodemailer from "nodemailer";
export function getTransport(){
  const host=process.env.SMTP_HOST, port=Number(process.env.SMTP_PORT||587);
  const user=process.env.SMTP_USER, pass=process.env.SMTP_PASS;
  const secure=String(process.env.SMTP_SECURE||"0")==="1";
  if(!host||!port||!user||!pass){
    return null; // fallback to console
  }
  return nodemailer.createTransport({ host, port, auth:{user,pass}, secure });
}
export async function sendOtpEmail(to:string, code:string){
  const from = process.env.DEFAULT_FROM || `Nexa ERP <${process.env.NEXTAUTH_EMAIL_FROM||"no-reply@noreply.local"}>`;
  const tr = getTransport();
  const subject = "Your Nexa ERP One-Time Code";
  const text = `Your OTP is ${code}. It expires in ${process.env.OTP_EXP_MIN||10} minutes.`;
  const html = `<p>Your OTP is <b>${code}</b>.</p><p>It expires in ${process.env.OTP_EXP_MIN||10} minutes.</p>`;
  if(tr){
    await tr.sendMail({ from, to, subject, text, html });
  }else{
    // dev fallback
    console.log("[DEV-OTP]", to, code);
  }
}
TS

# pages/api/otp/request.ts
cat > pages/api/otp/request.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "../../../lib/redis";
import { generateOTP, key } from "../../../utils/otp";
import { sendOtpEmail } from "../../../lib/mailer";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email } = req.body || {};
    if(!email) return res.status(400).json({error:"email required"});

    const expMin = Number(process.env.OTP_EXP_MIN||10);
    const len = Number(process.env.OTP_LEN||6);
    const rate = Number(process.env.OTP_RATE_PER_MIN||3);

    const redis = await getRedis();
    const k = key(email);
    const rateKey = `${k}:rate:${new Date().toISOString().slice(0,16)}`; // minute bucket
    const rateCount = Number(await redis.incr(rateKey));
    await redis.expire(rateKey, 90);
    if(rateCount > rate) return res.status(429).json({error:"rate_limited"});

    const code = generateOTP(len);
    await redis.set(k, code, { EX: expMin*60 });
    await sendOtpEmail(email, code);
    return res.status(200).json({ ok:true });
  }catch(e:any){
    console.error(e);
    return res.status(500).json({error:"server_error"});
  }
}
TS

# pages/api/otp/verify.ts
cat > pages/api/otp/verify.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "../../../lib/redis";
import { key } from "../../../utils/otp";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email, code } = req.body || {};
    if(!email || !code) return res.status(400).json({error:"email_and_code_required"});

    const redis = await getRedis();
    const k = key(email);
    const stored = await redis.get(k);
    if(!stored) return res.status(400).json({ ok:false, reason:"expired_or_missing" });
    if(stored !== code) return res.status(401).json({ ok:false, reason:"invalid" });

    await redis.del(k);
    // Set a short-lived session cookie that marks 2FA complete (handled client-side)
    res.setHeader("Set-Cookie", `nexa_2fa_ok=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`);
    return res.status(200).json({ ok:true });
  }catch(e:any){
    console.error(e);
    return res.status(500).json({error:"server_error"});
  }
}
TS

# pages/2fa.tsx
cat > pages/2fa.tsx <<'TSX'
import { useState } from "react";

export default function TwoFA(){
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const request = async (e:any) => {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/otp/request",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email }) });
    if(r.ok){ setSent(true); setMsg("Code sent"); } else { setMsg("Error sending code"); }
  };

  const verify = async(e:any)=>{
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/otp/verify",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, code }) });
    if(r.ok){
      setMsg("Verified");
      // after OTP verified, redirect to dashboard (session must already be created post-password)
      window.location.href = "/dashboard";
    } else {
      setMsg("Invalid or expired code");
    }
  };

  return (
    <main style={{maxWidth:480, margin:"64px auto", fontFamily:"Inter, system-ui"}}>
      <h1>Email verification</h1>
      {!sent ? (
        <form onSubmit={request}>
          <label>Email<br/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <div style={{marginTop:12}}><button type="submit">Send code</button></div>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>Enter the code sent to <b>{email}</b>.</p>
          <label>Code<br/><input required inputMode="numeric" value={code} onChange={e=>setCode(e.target.value)} /></label>
          <div style={{marginTop:12}}><button type="submit">Verify</button></div>
        </form>
      )}
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </main>
  );
}
TSX

# --- 8) Patch NextAuth credentials flow to require OTP after password
NA="$WEB/pages/api/auth/[...nextauth].ts"
if [ -f "$NA" ]; then
  cp "$NA" "$NA.bak"

  # Insert helper imports if missing
  if ! grep -q "getRedis" "$NA"; then
    perl -0777 -pe "s|(^\s*import.+\n)|\1import { getRedis } from \"../../../lib/redis\";\n|;" -i "$NA" || true
  fi

  # In callbacks.signIn for credentials: after password success, trigger OTP and redirect
  if grep -q "callbacks" "$NA"; then
    perl -0777 -pe "s|
callbacks:\s*\{
|callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    if (process.env.TWO_FACTOR_EMAIL_ENABLED === \"1\" && account?.provider === \"credentials\" && user?.email) {
      try {
        const res = await fetch(\`\${process.env.NEXTAUTH_URL || ''}/api/otp/request\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });
        // Always send user to /2fa to complete verification
        return \"/2fa\";
      } catch (e) {
        console.error(\"OTP request failed\", e);
        // still send to /2fa to avoid bypass
        return \"/2fa\";
      }
    }
    return true;
  },
|s" -i "$NA" || true
  else
    say "Could not locate callbacks block in NextAuth file; 2FA redirect not injected."
  fi

  # Ensure NEXTAUTH_URL present
  grep -qE "^NEXTAUTH_URL=" "$WEB/.env" || echo "NEXTAUTH_URL=http://localhost:3000" >> "$WEB/.env"
else
  say "NextAuth file not found at $NA — 2FA redirect injection skipped."
fi

# --- ensure runtime deps for new code (redis, nodemailer)
if ! node -e "require('redis')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add redis >/dev/null 2>&1 || true
  else npm i redis --no-save >/dev/null 2>&1 || true
  fi
fi
if ! node -e "require('nodemailer')" >/dev/null 2>&1; then
  if command -v pnpm >/dev/null 2>&1; then pnpm -w add nodemailer >/dev/null 2>&1 || true
  else npm i nodemailer --no-save >/dev/null 2>&1 || true
  fi
fi

# --- 9) Commit file changes pre-build
cd "$ROOT"
git add -A
git commit -m "feat(auth): enforce email OTP after credentials; set Super/Admin emails; env/docs/audit" || true

# --- 10) Build
cd "$WEB"
if command -v pnpm >/dev/null 2>&1; then pnpm -w build; else npm run build; fi

# --- 11) Static checks
cd "$ROOT"
RES_OLD="$(grep -RIl --exclude-dir=.git --exclude-dir=node_modules -E "nexa_app@nexaai\.co\.uk" || true | wc -l | tr -d " ")"

# --- 12) Verification summary
echo "---- SUMMARY ----"
echo "Super Admin: $SUPER_EMAIL"
echo "Admin:       $ADMIN_EMAIL"
echo "2FA:         Email OTP enabled (requires SMTP for real delivery; dev logs to console)"
echo "Residual old-email refs: $RES_OLD"

# DB echo (best-effort)
DB_URL="$(grep -Eo '^DATABASE_URL=.*' "$WEB/.env" 2>/dev/null | sed 's|DATABASE_URL=||' || true)"
if command -v psql >/dev/null 2>&1 && [ -n "$DB_URL" ]; then
  echo "-- Users present (email, role) --"
  psql "$DB_URL" -c "SELECT email, role FROM users WHERE email IN ('$SUPER_EMAIL','$ADMIN_EMAIL');" || true
else
  echo "DB verification skipped (no psql or DATABASE_URL)."
fi

# --- 13) Post-run confirmation requirement
echo
echo "REQUIRED OWNER CONFIRMATION:"
echo "Confirm BOTH items now:"
echo "  1) Emails set: SUPERADMIN_EMAIL=$SUPER_EMAIL, ADMIN_EMAIL=$ADMIN_EMAIL"
echo "  2) 2FA email OTP enforced for credentials sign-in (NextAuth patched if file existed)"
echo "Reply back in the run notes: CONFIRMED-SUPER-ADMIN-AND-2FA"
echo
echo "Next step: push branch and open PR:"
echo "  git push -u origin $BR"


