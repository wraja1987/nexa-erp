#!/usr/bin/env bash
set -euo pipefail

SHADOW_DATABASE_URL='postgresql://neondb_owner:npg_1icot3sHLxRz@ep-flat-wildflower-abzlxddv-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
psql "$SHADOW_DATABASE_URL" -f ops/sql/tenant/01-backfill-master-tenant.sql
psql "$SHADOW_DATABASE_URL" -f ops/sql/tenant/02-create-demo-tenant.sql
SHADOW_DATABASE_URL="$SHADOW_DATABASE_URL" pnpm -w prisma migrate deploy
pnpm -w prisma generate
echo "Shadow DB tenancy scripts applied."

PROD_DATABASE_URL='postgresql://neondb_owner:npg_1icot3sHLxRz@ep-mute-mode-abgfrh1w-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
psql "$PROD_DATABASE_URL" -f ops/sql/tenant/01-backfill-master-tenant.sql
psql "$PROD_DATABASE_URL" -f ops/sql/tenant/02-create-demo-tenant.sql
DATABASE_URL="$PROD_DATABASE_URL" pnpm -w prisma migrate deploy
pnpm -w prisma generate
echo "Prod DB tenancy scripts applied."



