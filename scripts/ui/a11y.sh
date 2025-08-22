#!/usr/bin/env bash
set -euo pipefail

THEME="${1:-light}"
BASE="${BASE_URL:-http://127.0.0.1:3000}"
ROOT="$(cd "$(dirname "$0")"/../.. && pwd)"
REPORTS_DIR="$ROOT/reports"

URLS=(
  "$BASE/"
  "$BASE/login"
  "$BASE/dashboard"
  "$BASE/help"
  "$BASE/settings/tenants"
)
if [[ "$THEME" == "dark" ]]; then
  URLS=(
    "$BASE/?theme=dark"
    "$BASE/login?theme=dark"
    "$BASE/dashboard?theme=dark"
    "$BASE/help?theme=dark"
    "$BASE/settings/tenants?theme=dark"
  )
fi

echo "A11Y scan starting (theme=$THEME, base=$BASE)"

mkdir -p "$REPORTS_DIR"
LOG="$REPORTS_DIR/.next-start-a11y.log"
: > "$LOG"

need_kill=0
server_pid=""

is_up() { curl -fsS "$BASE" >/dev/null 2>&1; }

# Ensure server is listening; if not, boot a temporary one
if ! is_up; then
  echo "No server on ${BASE} — building and starting ephemeral Next server…"
  pnpm --filter web build >>"$LOG" 2>&1 || true
  # bind explicitly to localhost to avoid container/DNS quirks
  (cd "$ROOT/apps/web" && npx --yes next start -p 3000 -H 127.0.0.1 >>"$LOG" 2>&1 & echo $! > "$REPORTS_DIR/.next-start.pid")
  server_pid="$(cat "$REPORTS_DIR/.next-start.pid" || true)"
  need_kill=1

  # Wait up to 60s for readiness
  if npx --yes wait-on -t 60000 "${BASE}"; then
    :
  else
    # Fallback polling (10s) in case wait-on isn’t available
    for i in {1..20}; do
      is_up && break || sleep 0.5
    done
  fi

  if ! is_up; then
    echo "❌ Next server failed to start on ${BASE}."
    echo "Last 120 log lines:"
    tail -n 120 "$LOG" || true
    [[ -n "$server_pid" ]] && kill "$server_pid" >/dev/null 2>&1 || true
    exit 90
  fi
fi

cleanup() {
  if [[ "$need_kill" == "1" ]]; then
    echo "Stopping ephemeral server (pid=${server_pid})"
    [[ -n "$server_pid" ]] && kill "$server_pid" >/dev/null 2>&1 || true
    pkill -f "next start -p 3000" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

# Run axe on each URL
fail=0
for u in "${URLS[@]}"; do
  echo "Running axe-core 4.10.3 (chrome-headless) => $u"
  node scripts/ui/run-axe.cjs "$u" || fail=1
done

if [[ $fail -ne 0 ]]; then
  echo "❌ a11y violations detected"
  exit 1
else
  echo "✅ a11y OK"
fi


