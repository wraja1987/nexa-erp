#!/usr/bin/env bash
set -euo pipefail
STAMP="${STAMP:-$(date +%Y%m%d-%H%M%S)}"
OUT="reports/phase5-summary-${STAMP}.md"
mkdir -p reports

pass=0; fail=0
ok(){ echo "✅ $1"; pass=$((pass+1)); }
bad(){ echo "❌ $1"; fail=$((fail+1)); }
run(){ set +e; "$@"; rc=$?; set -e; return $rc; }

{
  echo "# Phase 5 — Consolidated Summary ($STAMP)"
  echo
  echo "## Checklist"
} > "$OUT"

run pnpm -w lint               && ok "lint"               || bad "lint"
run pnpm -w typecheck          && ok "typecheck"          || bad "typecheck"
run pnpm -w test --reporter=dot && ok "unit tests"       || bad "unit tests"
run pnpm -w openapi:generate   && ok "openapi:generate"   || bad "openapi:generate"
run pnpm -w sdk:build          && ok "sdk:build"          || bad "sdk:build"
run pnpm -w golden:all         && ok "golden:all"         || bad "golden:all"
run pnpm -w --filter web build && ok "web build"          || bad "web build"
run pnpm -w ui:nav:lint        && ok "ui:nav:lint"        || bad "ui:nav:lint"
run pnpm -w ui:a11y            && ok "ui:a11y"            || bad "ui:a11y"
run pnpm -w ui:a11y:dark       && ok "ui:a11y:dark"       || bad "ui:a11y:dark"
run pnpm -w ui:perf            && ok "ui:perf"            || bad "ui:perf"
run pnpm -w ui:visual          && ok "ui:visual"          || bad "ui:visual"
run pnpm -w test:security      && ok "test:security"      || bad "test:security"
run pnpm -w gate:phase5        && ok "gate:phase5"        || bad "gate:phase5"

{
  echo
  echo "## Artifacts"
  [ -f apps/web/public/openapi.json ] && echo "- OpenAPI: apps/web/public/openapi.json"
  [ -d packages/sdk-nexa/dist ] && echo "- SDK: packages/sdk-nexa/dist"
  echo "- Goldens: scripts/tests/fixtures (invoice-sample.pdf, siem-sample.ndjson)"
  echo
  echo "## Totals"
  echo "PASS: $pass"
  echo "FAIL: $fail"
  echo
  if [ $fail -eq 0 ]; then
    echo "### Result: ✅ All checks passed"
    exit 0
  else
    echo "### Result: ❌ Some checks failed — see job logs"
    exit 1
  fi
} >> "$OUT"



