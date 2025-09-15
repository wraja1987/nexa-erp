#!/usr/bin/env bash
set -Eeuo pipefail
HOST="${1:-https://api.nexaai.co.uk}"
echo "[info] GET $HOST/health"
curl -fsSL "$HOST/health" || { echo "[warn] /health failed"; exit 1; }
echo "[ok] health passed"
echo "[info] GET $HOST/api/status"
curl -fsSL "$HOST/api/status" || { echo "[warn] /api/status failed"; exit 1; }
echo "[ok] status passed"
