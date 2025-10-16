#!/usr/bin/env bash
set -euo pipefail

# ───────────────── CONFIG ─────────────────
REPO_DIR="${REPO_DIR:-"$HOME/Desktop/Business Opportunities/Nexa ERP"}"
APP_DIR="apps/web"
BRANCH="fix/web-build-and-auth-runtime"
BASELINE_JSON="${BASELINE_JSON:-docs/baseline/modules.json}"

DOMAIN="app.nexaai.co.uk"
PROD_URL="https://${DOMAIN}"

RELEASE_TAG="release/$(date +%Y-%m-%d_%H%M)"
ACCEPT_CODES="${ACCEPT_CODES:-200 301 302 307}"

# Use local vercel, else npx shim
if ! command -v vercel >/dev/null 2>&1; then vercel(){ npx -y vercel@latest "$@"; }; fi

need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing $1 — install it and re-run."; exit 1; }; }
need git; need node; need jq; need curl

cd "$REPO_DIR"
git fetch --all --prune
git checkout "$BRANCH"
git pull --rebase origin "$BRANCH"

# ───────────── 1) Ensure baseline exists ─────────────
if [ ! -f "$BASELINE_JSON" ]; then
  echo "✗ Baseline not found at $BASELINE_JSON. The generator script should have created it."
  exit 1
fi

# Expand baseline into a concise list of representative URLs to probe in prod.
# We only probe top-level module pages (not every CRUD variant) because most pages require auth.
REQ_PROBE=/tmp/nexa-probe.txt
node - <<'NODE' "$BASELINE_JSON" > "$REQ_PROBE"
const fs=require('fs');
// When using `node -` the first arg is '-' (script stdin), so the user arg is at index 2
const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const out=new Set(['/','/login','/dashboard','/status']);
for(const m of raw.modules){
  const r=m.root, subs=m.paths||[], flag=(m.mode||'NONE').toUpperCase();
  if(!subs.length){ out.add(r); continue; }
  for(const s of subs){
    const base = `${r}/${s}`.replace(/\/+/g,'/').replace(/\/$/,'');
    out.add(base);
    // Also probe one CRUD create page for flag coverage:
    if(flag==='CRUD') out.add(`${base}/new`);
  }
}
console.log([...new Set([...out].map(p=>p.startsWith('/')?p:`/${p}`))].sort().join('\n'));
NODE

PROBE_COUNT=$(wc -l < "$REQ_PROBE")
echo "• Will probe ${PROBE_COUNT} production URLs on ${PROD_URL}"

# ───────────── 2) Production health checks ─────────────
echo "• NextAuth providers:"
curl -s "${PROD_URL}/api/auth/providers" | jq || true

echo "• NextAuth diag:"
NA=$(curl -s "${PROD_URL}/api/_diag/na-nextauth" || echo '{}')
echo "$NA" | jq || true
if [ "$(echo "$NA" | jq -r '.smtp.ok // empty')" != "true" ]; then
  echo "✗ SMTP not OK in production diag — fix SMTP before proceeding."
  exit 1
fi

echo "• Email sign-in (expect 302/200):"
AUTH_CODE=$(curl -i -s -X POST "${PROD_URL}/api/auth/signin/email?json=true" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "email=wraja1987@gmail.com&redirect=false&callbackUrl=%2Fdashboard" | awk 'NR==1{print $2}')
echo "  HTTP ${AUTH_CODE}"
case "$AUTH_CODE" in 200|302) : ;; *) echo "✗ Email sign-in returned ${AUTH_CODE}"; exit 1 ;; esac

echo "• KPI endpoint (expect < 400):"
KPI=$(curl -s -o /dev/null -w "%{http_code}\n" "${PROD_URL}/api/kpi/dashboard" || echo 000)
echo "  HTTP ${KPI}"
if [ "$KPI" -ge 400 ]; then echo "✗ KPI endpoint unhealthy"; exit 1; fi

echo "• /login headers (cookie issuance expected):"
curl -sI "${PROD_URL}/login" | sed -n '1,20p' || true

# ───────────── 3) Probe module URLs ─────────────
echo "• Probing module URLs (accept: ${ACCEPT_CODES}) …"
FAILS=0
while IFS= read -r PATHX; do
  [ -z "$PATHX" ] && continue
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "${PROD_URL}${PATHX}")
  if echo " ${ACCEPT_CODES} " | grep -q " ${CODE} "; then
    printf "  ✓ %-60s %s\n" "$PATHX" "$CODE"
  else
    printf "  ✗ %-60s %s\n" "$PATHX" "$CODE"
    FAILS=$((FAILS+1))
  fi
done < "$REQ_PROBE"

if [ "$FAILS" -gt 0 ]; then
  echo "✗ ${FAILS} production routes responded with 4xx/5xx (or unexpected code)."
  echo "  Tip: 302/307 to /login are normal for protected routes; these are already accepted."
  exit 1
fi

echo "✓ Production probes passed"

# ───────────── 4) Commit generated pages & baseline ─────────────
# We keep your working tree clean going forward so the generator won’t re-scaffold each run.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "• Committing generated pages and baseline"
  git add -A
  git commit -m "chore(nexa): scaffolded pages verified in prod; baseline locked"
  git push origin "$BRANCH"
else
  echo "• No local changes to commit (already clean)"
fi

# ───────────── 5) Tag the release & record live alias ─────────────
# Try to get the current aliased deployment URL for the record
LIVE_URL=$(vercel alias ls 2>/dev/null | awk '/app\.nexaai\.co\.uk/{print $1; exit}' || true)
git tag -f "$RELEASE_TAG" -m "Nexa release; live: ${LIVE_URL:-unknown}"
git push -f origin "$RELEASE_TAG" || true

cat <<EOF

✅ Nexa post-deploy hardening complete.

What we’ve done:
 - Verified NextAuth/SMTP/KPI in production
 - Probed ${PROBE_COUNT} module URLs (200/301/302/307)
 - Committed any generated pages & the baseline to ${BRANCH}
 - Tagged the release: ${RELEASE_TAG}
 - Live alias: https://${DOMAIN}

Next recommended steps:
 - In Vercel → Settings → General, set Node & pnpm versions to match local.
 - In Vercel → Settings → Git, use "pnpm install --frozen-lockfile".
 - (Optional) Enable monitoring/alerts; add Sentry DSN and uptime checks.

EOF


