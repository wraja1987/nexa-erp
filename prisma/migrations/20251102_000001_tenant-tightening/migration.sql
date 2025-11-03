-- tenant-tightening (create-only)
-- Add tenantId columns and indexes for models that were missing them.
-- Note: Columns are added nullable here; run backfill scripts, then optionally enforce NOT NULL in a follow-up.

ALTER TABLE "WebhookEvent"     ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "EntityExt"        ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "IntercompanyTxn"  ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "ConsolidationMap" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "JournalLine"      ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "PoLine"           ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "RoutingStep"      ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Deduction"        ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Allowance"        ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

CREATE INDEX IF NOT EXISTS "WebhookEvent_tenantId_idx"     ON "WebhookEvent"("tenantId");
CREATE INDEX IF NOT EXISTS "EntityExt_tenantId_idx"        ON "EntityExt"("tenantId");
CREATE INDEX IF NOT EXISTS "IntercompanyTxn_tenantId_idx"  ON "IntercompanyTxn"("tenantId");
CREATE INDEX IF NOT EXISTS "ConsolidationMap_tenantId_idx" ON "ConsolidationMap"("tenantId");
CREATE INDEX IF NOT EXISTS "JournalLine_tenantId_idx"      ON "JournalLine"("tenantId");
CREATE INDEX IF NOT EXISTS "PoLine_tenantId_idx"           ON "PoLine"("tenantId");
CREATE INDEX IF NOT EXISTS "RoutingStep_tenantId_idx"      ON "RoutingStep"("tenantId");
CREATE INDEX IF NOT EXISTS "Deduction_tenantId_idx"        ON "Deduction"("tenantId");
CREATE INDEX IF NOT EXISTS "Allowance_tenantId_idx"        ON "Allowance"("tenantId");

-- After backfill, enforce NOT NULL to match Prisma schema
ALTER TABLE "WebhookEvent"     ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "EntityExt"        ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "IntercompanyTxn"  ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ConsolidationMap" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "JournalLine"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "PoLine"           ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "RoutingStep"      ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Deduction"        ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Allowance"        ALTER COLUMN "tenantId" SET NOT NULL;


