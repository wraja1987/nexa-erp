\set ON_ERROR_STOP on
\echo '=== VERIFY KPIs (tenant-scoped) ==='
WITH t AS (SELECT id AS tid FROM public.tenant WHERE code = :tcode)
SELECT 'invoices' tbl, date_trunc('month', date)::date m, count(*) n, sum(total)::numeric(14,2) total
FROM invoices CROSS JOIN t WHERE tenantid=t.tid GROUP BY 1,2 ORDER BY 2;
WITH t AS (SELECT id AS tid FROM public.tenant WHERE code = :tcode)
SELECT 'bills' tbl, date_trunc('month', date)::date m, count(*) n, sum(total)::numeric(14,2) total
FROM bills CROSS JOIN t WHERE tenantid=t.tid GROUP BY 1,2 ORDER BY 2;
WITH t AS (SELECT id AS tid FROM public.tenant WHERE code = :tcode)
SELECT 'payments' tbl, date_trunc('month', date)::date m, count(*) n, sum(amount)::numeric(14,2) amount
FROM payments CROSS JOIN t WHERE tenantid=t.tid GROUP BY 1,2 ORDER BY 2;
WITH t AS (SELECT id AS tid FROM public.tenant WHERE code = :tcode)
SELECT 'pos' tbl, date_trunc('month', date)::date m, count(*) n, sum(gross_total)::numeric(14,2) total
FROM pos_receipts CROSS JOIN t WHERE tenantid=t.tid GROUP BY 1,2 ORDER BY 2;
WITH t AS (SELECT id AS tid FROM public.tenant WHERE code = :tcode)
SELECT 'timesheets' tbl, date_trunc('month', work_date)::date m, sum(hours)::numeric(14,2) hours
FROM timesheets CROSS JOIN t WHERE tenantid=t.tid GROUP BY 1,2 ORDER BY 2;
