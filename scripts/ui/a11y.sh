#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-light}"

# Start dev server if not up
port=3000
if ! nc -z localhost "$port" >/dev/null 2>&1; then
  (pnpm --filter apps/web dev >/tmp/optra-web-a11y.log 2>&1 & echo $! > /tmp/optra-web-a11y.pid)
  for i in {1..60}; do curl -fsS "http://localhost:$port" >/dev/null 2>&1 && break || sleep 0.5; done
fi

# if dark mode, append ?theme=dark; otherwise plain
qs=""
if [ "$MODE" = "dark" ]; then qs="?theme=dark"; fi

URLS=(
  "http://localhost:$port/$qs"
  "http://localhost:$port/login$qs"
  "http://localhost:$port/dashboard$qs"
  "http://localhost:$port/help$qs"
  "http://localhost:$port/settings/tenants$qs"
)

# Run axe CLI (npx so we don’t add deps)
FAIL=0
for u in "${URLS[@]}"; do
  echo "A11Y scan: $u"
  npx --yes @axe-core/cli "$u" --load-delay 500 || FAIL=1
done

# Stop server we started
if [ -f /tmp/optra-web-a11y.pid ]; then
  kill "$(cat /tmp/optra-web-a11y.pid)" 2>/dev/null || true
  rm -f /tmp/optra-web-a11y.pid
fi

exit $FAIL


