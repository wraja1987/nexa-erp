#!/usr/bin/env bash
set -Eeuo pipefail
# Run on VPS after extracting the backend bundle
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml ps
