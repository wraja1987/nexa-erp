\set ON_ERROR_STOP on
\echo '=== KPI VERIFY (tenant-scoped) ==='
WITH t AS (
  SELECT id AS tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1
)
SELECT 'Invoice' tbl, date_trunc('month', "issuedAt")::date m, count(*) n, sum(total)::numeric(14,2) s
FROM public."Invoice", t WHERE "Invoice"."tenantId" = t.tid GROUP BY 1,2 ORDER BY 2;

WITH t AS (
  SELECT id AS tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1
)
SELECT 'SupplierBill' tbl, date_trunc('month', "receivedAt")::date m, count(*) n, sum(total)::numeric(14,2) s
FROM public."SupplierBill", t WHERE "SupplierBill"."tenantId" = t.tid GROUP BY 1,2 ORDER BY 2;

WITH t AS (
  SELECT id AS tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1
)
SELECT 'CustomerPayment' tbl, date_trunc('month', "paidAt")::date m, count(*) n, sum(amount)::numeric(14,2) s
FROM public."CustomerPayment", t WHERE "CustomerPayment"."tenantId" = t.tid GROUP BY 1,2 ORDER BY 2;

WITH t AS (
  SELECT id AS tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1
)
SELECT 'PurchaseOrder' tbl, date_trunc('month', "orderDate")::date m, count(*) n
FROM public."PurchaseOrder", t WHERE "PurchaseOrder"."tenantId" = t.tid GROUP BY 1,2 ORDER BY 2;

WITH t AS (
  SELECT id AS tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1
)
SELECT 'PosSale' tbl, date_trunc('month', "createdAt")::date m, count(*) n, sum(total)::numeric(14,2) s
FROM public."PosSale", t WHERE "PosSale"."tenantId" = t.tid GROUP BY 1,2 ORDER BY 2;
