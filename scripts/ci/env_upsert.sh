#!/usr/bin/env bash
set -euo pipefail
ENV_FILE="apps/web/.env.local"
mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"
key="$1"; val="$2"
if grep -q "^${key}=" "$ENV_FILE"; then
  sed -i "" "s#^${key}=.*#${key}=${val//#/\\#}#g" "$ENV_FILE"
else
  printf "%s=%s\n" "$key" "$val" >> "$ENV_FILE"
fi
