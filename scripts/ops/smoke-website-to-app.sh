#!/usr/bin/env bash
set -euo pipefail
SITE="${SITE:-https://nexaai.co.uk}"
APP="${APP:-https://app.nexaai.co.uk}"

echo "Website /login should 308 to app /login"
code=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/login" || true)
loc=$(curl -s -I "$SITE/login" | awk -F:
