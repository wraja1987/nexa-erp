-- 02-create-demo-tenant.sql
INSERT INTO "Tenant" (id, name, slug)
VALUES ('demo', 'Demo Tenant', 'demo')
ON CONFLICT (id) DO NOTHING;







