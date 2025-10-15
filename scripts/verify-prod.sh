#!/usr/bin/env bash
set -e
BASE="https://app.nexaai.co.uk"
echo "# ping"; curl -s "$BASE/api/ping"; echo; echo
echo "# providers"; curl -s "$BASE/api/auth/providers"; echo; echo
echo "# diag"; curl -s "$BASE/api/_diag/na-health" || true; echo; echo
echo "# POST email (no CSRF - may 302)"; curl -i -X POST "$BASE/api/auth/signin/email?json=true" -H "content-type: application/x-www-form-urlencoded" --data "email=test@example.com&callbackUrl=%2Fdashboard" | sed -n '1,20p'; echo


