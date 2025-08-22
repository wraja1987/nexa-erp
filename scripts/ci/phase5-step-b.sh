#!/usr/bin/env bash
set -euo pipefail
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="reports/phase5-step-b-${STAMP}.md"
mkdir -p reports

pass=0; fail=0
ok(){ echo "✅ $1"; pass=$((pass+1)); }
bad(){ echo "❌ $1"; fail=$((fail+1)); }

echo "== Lint/typecheck/tests ==" | tee "$OUT"
pnpm -w lint && ok "lint" || bad "lint"
pnpm -w typecheck && ok "typecheck" || bad "typecheck"
pnpm -w test --reporter=dot >/tmp/p5-tests.log 2>&1 && ok "unit tests" || { bad "unit tests"; tail -n 120 /tmp/p5-tests.log || true; }

echo "== UI checks ==" | tee -a "$OUT"
pnpm -w ui:nav:lint && ok "ui:nav:lint" || bad "ui:nav:lint"
pnpm -w ui:a11y && ok "ui:a11y" || bad "ui:a11y"
pnpm -w ui:a11y:dark && ok "ui:a11y:dark" || bad "ui:a11y:dark"
pnpm -w ui:perf && ok "ui:perf" || bad "ui:perf"
pnpm -w ui:visual && ok "ui:visual" || bad "ui:visual"

echo "== Security & gates ==" | tee -a "$OUT"
pnpm -w test:security && ok "test:security" || bad "test:security"
pnpm -w gate:phase5 && ok "gate:phase5" || bad "gate:phase5"

{
  echo "# Phase 5 — Step B Report ($STAMP)"
  echo
  echo "## Totals"
  echo "- PASS: $pass"
  echo "- FAIL: $fail"
  echo
  echo "## Result"
  if [ $fail -eq 0 ]; then
    echo "✅ Step B checks passed. Ready for review."
  else
    echo "❌ Step B has failures. See console output above."
  fi
} >> "$OUT"

echo "Report: $OUT"

