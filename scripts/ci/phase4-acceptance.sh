#!/usr/bin/env bash
set -euo pipefail

# Determine repo root dynamically; fallback to previous default if not a git repo
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO="$(git rev-parse --show-toplevel)"; cd "$REPO"
else
  REPO="${REPO:-$(pwd)}"; cd "$REPO"
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="reports/phase4-acceptance-$STAMP.md"
mkdir -p reports

pass=0; fail=0
ok(){ echo "✅ $1"; pass=$((pass+1)); }
bad(){ echo "❌ $1"; fail=$((fail+1)); }

{
  echo "# Phase 4 – Acceptance Gate ($STAMP)"
  echo "_Branch_: $(git rev-parse --abbrev-ref HEAD)"
  echo "_HEAD_: $(git rev-parse --short HEAD)"
  echo
} > "$OUT"

echo "== Baseline & tags =="
git fetch --tags origin --prune
git tag -l | grep -q "^phase-3-complete$" && ok "Tag phase-3-complete present" || bad "Missing tag phase-3-complete"
git merge-base --is-ancestor "$(git rev-parse phase-3-complete)" HEAD && ok "Built on Phase‑3 hardened tag" || bad "HEAD not based on Phase‑3 tag"

echo
echo "== DB & migrations =="
if nc -z localhost 5432; then
  ok "Postgres reachable :5432"
  pnpm prisma validate >/dev/null 2>&1 && ok "prisma validate" || bad "prisma validate"
  MIG_APPLIED=$(ls -1 prisma/migrations | tail -n1 | sed "s/^[0-9_]*//")
  echo "Last migration: $MIG_APPLIED"
else
  bad "Postgres not reachable; migrations validated previously but cannot re-check live"
fi

echo
echo "== Seeds snapshot (superadmin only, expiry, masking) =="
if node - <<'JS'
const fs=require('fs');
try{
  const s=fs.readFileSync('scripts/seeds/seed-phase4.ts','utf8');
  const hasVisibility=/DemoDataVisibility|visibility.*admin/i.test(s);
  const hasExpiry=/visibleUntil|expiry|expiresAt/i.test(s);
  const hasMask=/mask|redact/i.test(s);
  if (hasVisibility && hasExpiry && hasMask) process.exit(0);
  process.exit(1);
}catch(e){ process.exit(1); }
JS
then ok "Seeds include visibility+expiry+masking controls"; else bad "Seeds missing one of: visibility/expiry/masking"; fi

echo
echo "== Workspace lint/typecheck/tests =="
pnpm -w lint && ok "lint" || bad "lint"
pnpm -w typecheck && ok "typecheck" || bad "typecheck"
pnpm -w test --reporter=dot >/tmp/p4-tests.log 2>&1 && ok "unit tests (web+mobile)" || { bad "unit tests"; tail -n 80 /tmp/p4-tests.log || true; }

echo
echo "== Goldens & APIs =="
pnpm -w openapi:generate && pnpm -w sdk:build && ok "OpenAPI generated & SDK built" || bad "OpenAPI/SDK build"
pnpm -w golden:all && ok "goldens (invoice PDF hash + SIEM NDJSON)" || bad "goldens"

echo
echo "== Web build & secrecy guard =="
pnpm --filter web build >/tmp/p4-web-build.log 2>&1 && ok "next build (web)" || { bad "next build (web)"; tail -n 80 /tmp/p4-web-build.log || true; }
bash scripts/ci/prelogin-guard-web.sh >/tmp/p4-web-guard.log 2>&1 && ok "pre‑login secrecy (web)" || { bad "pre‑login secrecy (web)"; cat /tmp/p4-web-guard.log; }

echo
echo "== Mobile tests & secrecy guard =="
pnpm --filter mobile test >/tmp/p4-mobile-tests.log 2>&1 && ok "mobile unit tests" || { bad "mobile unit tests"; tail -n 80 /tmp/p4-mobile-tests.log || true; }
bash scripts/ci/prelogin-guard-mobile.sh >/tmp/p4-mobile-guard.log 2>&1 && ok "pre‑login secrecy (mobile)" || { bad "pre‑login secrecy (mobile)"; cat /tmp/p4-mobile-guard.log; }

echo
echo "== Route/screen stubs (200/OK) =="
probe(){ u="$1"; code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$u" || echo 000); printf "%-28s -> %s\n" "$u" "$code"; [ "$code" = 200 ] || exit 1; }
# start dev briefly for probes
for p in 3000 3001; do P=$(lsof -ti :$p || true); [ -n "$P" ] && kill -9 $P || true; done
( pnpm --filter web dev >/tmp/p4-web-dev.log 2>&1 & echo $! >/tmp/p4-web.pid )
for i in {1..40}; do curl -fsS "http://localhost:3000" >/dev/null 2>&1 && break || sleep 0.5; done || true
set +e
probe /dashboard && probe /billing/plans && probe /dev/api-keys && probe /monitoring/status && probe /help && probe /settings/tenants
RC=$?
kill "$(cat /tmp/p4-web.pid 2>/dev/null)" 2>/dev/null || true
rm -f /tmp/p4-web.pid
set -e
[ $RC -eq 0 ] && ok "web stubs respond 200 (coming soon)" || bad "one or more web stubs not 200"

echo
echo "== Compile checklist =="
echo "- PASS items: $pass" | tee -a "$OUT"
echo "- FAIL items: $fail" | tee -a "$OUT"
[ $fail -eq 0 ] && echo "ACCEPTANCE: ✅ Ready for PR review" | tee -a "$OUT" || echo "ACCEPTANCE: ❌ Fix required before PR" | tee -a "$OUT"

echo
echo "== Print PR link =="
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "PR: https://github.com/wraja1987/optra-erp/compare/main...$BRANCH?expand=1"
echo "Actions: https://github.com/wraja1987/optra-erp/actions?query=branch%3A${BRANCH//\//%2F}"

if [ $fail -eq 0 ]; then
  if git rev-parse -q --verify refs/tags/phase-4-ready >/dev/null; then
    echo "Tag phase-4-ready already exists."
  else
    git tag -a phase-4-ready -m "Phase 4 acceptance passed"
    git push origin phase-4-ready || true
    echo "Tagged: phase-4-ready"
  fi
fi

echo
echo "== Acceptance report =="
cat "$OUT"

