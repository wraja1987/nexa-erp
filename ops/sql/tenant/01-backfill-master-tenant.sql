-- 01-backfill-master-tenant.sql
INSERT INTO "Tenant" (id, name, slug)
VALUES ('master', 'Nexa Master Tenant', 'master')
ON CONFLICT (id) DO NOTHING;

UPDATE "WebhookEvent"     SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "EntityExt"        SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "IntercompanyTxn"  SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "ConsolidationMap" SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "JournalLine"      SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "PoLine"           SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "RoutingStep"      SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "Deduction"        SET "tenantId" = 'master' WHERE "tenantId" IS NULL;
UPDATE "Allowance"        SET "tenantId" = 'master' WHERE "tenantId" IS NULL;


