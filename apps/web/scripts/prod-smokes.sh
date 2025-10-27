#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-https://app.nexaai.co.uk}"
echo "Providers:"; curl -s $BASE/api/auth/providers | jq -r 'keys[]'
for p in /dashboard /finance /inventory /manufacturing /sales /projects /hr /pos /ai; do
  code=$(curl -s -o /dev/null -I -w "%{http_code}" $BASE$p)
  loc=$(curl -s -I $BASE$p | awk -F': ' '/^location:/ {print $2}' || true)
  echo "$p => $code ${loc:-}"
done
echo "Forgot-password probe:"
curl -s -X POST $BASE/api/auth/forgot-password -H "content-type: application/json" -d '{"email":"wraja1987@gmail.com"}' | jq