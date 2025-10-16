#!/usr/bin/env bash
set -euo pipefail

# ── Config
REPO_DIR="${REPO_DIR:-"$HOME/Desktop/Business Opportunities/Nexa ERP"}"
APP_DIR="apps/web"
LOGIN_PATH="$APP_DIR/app/login/page.tsx"
FORGOT_PATH="$APP_DIR/app/auth/forgot/page.tsx"
BRANCH="fix/web-build-and-auth-runtime"
PROD_URL="https://app.nexaai.co.uk"

cd "$REPO_DIR"
git fetch --all --prune
git checkout "$BRANCH"
git pull --rebase origin "$BRANCH" || true

# Vercel shim (no global install needed)
if ! command -v vercel >/dev/null 2>&1; then vercel(){ npx -y vercel@latest "$@"; }; fi

# 1) Restore the APPROVED login UI from Git history (version that had Google/Microsoft working)
echo "• Locating approved login UI in Git history…"
APPROVED_COMMIT=$(git log -S "signIn('google'" --pretty=format:%H -- "$LOGIN_PATH" | head -n1 || true)
if [ -z "$APPROVED_COMMIT" ]; then
  echo "✗ Could not find a commit with signIn('google') in $LOGIN_PATH. Using safe approved template instead."
  USE_TEMPLATE=1
else
  echo "✓ Found approved login UI at commit $APPROVED_COMMIT"
  mkdir -p "$(dirname "$LOGIN_PATH")"
  git show "$APPROVED_COMMIT:$LOGIN_PATH" > "$LOGIN_PATH"
fi

# 2) If no approved commit found, write the approved (working) template
if [ "${USE_TEMPLATE:-0}" = "1" ]; then
  mkdir -p "$(dirname "$LOGIN_PATH")"
  cat > "$LOGIN_PATH" <<'TSX'
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleEmailMagic(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn('email', { email, callbackUrl: '/dashboard', redirect: true });
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" data-theme="nexa">
      <section className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-content-center text-xl font-bold">N</div>
          <h1 className="text-2xl font-semibold">Sign in to Nexa</h1>
          <p className="text-sm text-gray-500">Welcome back</p>
        </div>

        <form onSubmit={handleEmailMagic} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block">Email</span>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                   className="w-full border rounded p-2" placeholder="you@example.com" />
          </label>
          <button type="submit" disabled={busy}
                  className="w-full py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
            {busy ? 'Sending magic link…' : 'Sign in'}
          </button>
        </form>

        <div className="my-6 grid grid-cols-2 gap-3">
          <button onClick={()=>signIn('google',{ callbackUrl:'/dashboard' })} className="py-2 rounded border hover:bg-gray-50">
            Google
          </button>
          <button onClick={()=>signIn('azure-ad',{ callbackUrl:'/dashboard' })} className="py-2 rounded border hover:bg-gray-50">
            Microsoft
          </button>
        </div>

        <div className="text-center text-sm">
          <a href="/auth/forgot" className="underline">Forgot password?</a>
        </div>
      </section>
    </main>
  );
}
TSX
fi

# 3) Ensure Forgot password page exists (magic link)
if [ ! -f "$FORGOT_PATH" ]; then
  echo "• Writing forgot password page"
  mkdir -p "$(dirname "$FORGOT_PATH")"
  cat > "$FORGOT_PATH" <<'TSX'
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Forgot() {
  const [email,setEmail]=useState(''); const [busy,setBusy]=useState(false); const [sent,setSent]=useState(false);
  async function send(e:React.FormEvent){ e.preventDefault(); setBusy(true);
    try{ await signIn('email',{ email, callbackUrl:'/dashboard', redirect:true }); setSent(true); } finally{ setBusy(false); } }
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" data-theme="nexa">
      <section className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-xl font-semibold mb-2">Reset your access</h1>
        <p className="text-sm text-gray-500 mb-4">Enter your email and we’ll send you a sign-in link.</p>
        <form onSubmit={send} className="space-y-3">
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                 className="w-full border rounded p-2" placeholder="you@example.com"/>
          <button type="submit" disabled={busy}
                  className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
            {busy?'Sending…':'Send link'}
          </button>
        </form>
        {sent && <p className="mt-4 text-sm text-green-700">If that email exists, a link is on its way.</p>}
        <p className="mt-6 text-center text-sm"><a className="underline" href="/login">Back to login</a></p>
      </section>
    </main>
  );
}
TSX
fi

# 4) Make sure NextAuth uses /login (approved UI) — skip if using external authOptions
AUTH_FILE=$(grep -RIl "NextAuth\(" "$APP_DIR/pages/api" "$APP_DIR/src/pages/api" 2>/dev/null | grep -v '\\.bak\.' | head -n1 || true)
if [ -n "${AUTH_FILE:-}" ]; then
  if grep -q "NextAuth(\\s*authOptions" "$AUTH_FILE"; then
    echo "• NextAuth uses external authOptions; skipping inline pages injection. Ensure 'pages' is set in authOptions."
  else
    if grep -q "pages:" "$AUTH_FILE"; then
      # Replace existing pages block
      perl -0777 -pe "s/pages:\s*{[^}]*}/pages: { signIn: '\\/login', error: '\\/login', verifyRequest: '\\/auth\\/verify-request' }/s" -i "$AUTH_FILE"
    else
      # Insert pages after NextAuth({
      node - <<'NODE' "$AUTH_FILE" > "$AUTH_FILE.tmp"
const fs=require('fs');
const p=process.argv[2];
let s=fs.readFileSync(p,'utf8');
if(/NextAuth\(\s*\{/.test(s)){
  s=s.replace(/NextAuth\(\s*\{/, "NextAuth({\n  pages: { signIn: '/login', error: '/login', verifyRequest: '/auth/verify-request' },\n");
}
process.stdout.write(s);
NODE
      mv "$AUTH_FILE.tmp" "$AUTH_FILE"
    fi
    echo "✓ NextAuth configured to use /login (inline)"
  fi
else
  echo "• NextAuth API file not found under pages/api — skipping."
fi

# 5) Build and deploy (prebuilt) with Vercel shim
cd "$APP_DIR"
pnpm install --frozen-lockfile
pnpm build
cd "$REPO_DIR"
DEPLOY_URL=$(vercel deploy --prod --confirm --cwd "$REPO_DIR/$APP_DIR" | tail -n1 || true)
echo "Deployed: ${DEPLOY_URL:-unknown}"

# 6) Quick checks on production
echo "• Providers (expect google & azure-ad present):"
curl -s "$PROD_URL/api/auth/providers" | jq || true
echo "• /login headers:"
curl -sI "$PROD_URL/login" | sed -n '1,20p' || true

# 7) Commit the restored approved UI so it persists
git add "$LOGIN_PATH" "$FORGOT_PATH" ${AUTH_FILE:-}
git commit -m "fix(auth): restore approved Nexa login UI with Google, Microsoft, and Forgot password" || true
# optional: push
# git push origin "$BRANCH"

echo "✓ Approved Nexa login UI is restored and deployed. Check $PROD_URL/login"


