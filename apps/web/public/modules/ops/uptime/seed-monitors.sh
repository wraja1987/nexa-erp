#!/usr/bin/env bash
set -euo pipefail

KUMA_URL=${KUMA_URL:-"http://localhost:3003"}

echo "Seed script example for Uptime Kuma (use UI or API token to add)"
echo "- API: https://api.nexaai.co.uk/api/public/status (expect 200, SSL)"
echo "- Portal: https://nexaai.co.uk/ (200 + content match)"
echo "- Website: https://nexaai.co.uk/ (200 + content match)"
echo "- Weekly report: nexaaierp@gmail.com"

# If Uptime Kuma API is configured, you can use curl with your login/session or token.
# Example payloads (replace <CSRF>, <COOKIE>, <TOKEN>):
# curl -X POST "$KUMA_URL/api/heartbeat" -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
#  -d '{"type":"http","name":"Nexa API","url":"https://api.nexaai.co.uk/api/public/status","interval":60,"maxretries":1}'

