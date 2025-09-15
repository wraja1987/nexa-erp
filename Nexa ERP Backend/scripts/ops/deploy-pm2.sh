#!/usr/bin/env bash
set -Eeuo pipefail
# Run on VPS after extracting the backend bundle
npm i -g pm2
pm2 start pm2/ecosystem.config.cjs --env production
pm2 save
pm2 status
