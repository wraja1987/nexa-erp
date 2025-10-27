#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set Neon production DATABASE_URL}"
export PRISMA_HIDE_UPDATE_MESSAGE=1

TS=$(date +%Y%m%d-%H%M%S)
REPORT_DIR="reports/data-seed-${TS}"
mkdir -p "$REPORT_DIR"/{auth,sql,ui,logs}
echo "[ENV] tenant=${TENANT_CODE:-NEXA_DEMO} base=${BASE_URL:-https://app.nexaai.co.uk}"

command -v corepack >/dev/null 2>&1 && corepack enable || true
if ! command -v pnpm >/dev/null 2>&1; then corepack use pnpm@10 || true; fi
pnpm install
pnpm approve-builds prisma @prisma/client @prisma/engines || true
pnpm add -D prisma >/dev/null 2>&1 || true
pnpm add @prisma/client >/dev/null 2>&1 || true
pnpm add -D ts-node @types/node @playwright/test >/dev/null 2>&1 || true
pnpm add bcrypt >/dev/null 2>&1 || true

if [ -z "${PRISMA_SCHEMA_PATH:-}" ]; then
  PRISMA_SCHEMA_PATH="$(find . -maxdepth 5 -path '*/prisma/schema.prisma' | head -n1 || true)"
fi
[ -f "${PRISMA_SCHEMA_PATH:-}" ] || { echo "Prisma schema not found. Set PRISMA_SCHEMA_PATH and rerun."; exit 1; }
echo "[PRISMA] schema=${PRISMA_SCHEMA_PATH}"

npx prisma generate --schema "${PRISMA_SCHEMA_PATH}"
npx prisma migrate deploy --schema "${PRISMA_SCHEMA_PATH}"

mkdir -p prisma/ensure prisma/seed-data scripts/{verify,clean,kpi} tests/e2e reports

cat > prisma/ensure/ensure-tenant-and-users.ts <<'TS'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL!;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD!;
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const tenantCode = process.env.TENANT_CODE || 'NEXA_DEMO';
  const tenantName = process.env.TENANT_NAME || 'Nexa Demo Ltd';
  const tenant = await prisma.tenant.upsert({
    where: { code: tenantCode }, update: { name: tenantName }, create: { code: tenantCode, name: tenantName }
  });
  const superHash = await bcrypt.hash(superPassword, 12);
  const adminHash  = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: superEmail },
    update: { role: 'SUPER_ADMIN', password: superHash, tenantId: null },
    create: { email: superEmail, role: 'SUPER_ADMIN', password: superHash, tenantId: null },
  });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', password: adminHash, tenantId: tenant.id },
    create: { email: adminEmail, role: 'ADMIN', password: adminHash, tenantId: tenant.id },
  });
  console.log(JSON.stringify({ tenant }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
TS

cat > prisma/seed-data/seed-12mo.sql <<'SQL'
\echo '=== NEXA SEED (12 months) ==='
\set ON_ERROR_STOP on
SET client_min_messages TO WARNING;
DO $$
DECLARE
  v_code text := current_setting('app.tenant_code', true);
  v_tid uuid;
  v_now date := (now() at time zone 'Europe/London')::date;
  v_end date := date_trunc('month', v_now)::date;
  v_start date := (v_end - interval '11 months')::date;
  m date;
BEGIN
  IF v_code IS NULL THEN RAISE EXCEPTION 'app.tenant_code not set'; END IF;
  SELECT id INTO v_tid FROM public.tenant WHERE code = v_code;
  IF v_tid IS NULL THEN RAISE EXCEPTION 'Tenant % not found', v_code; END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invoices';            IF NOT FOUND THEN RAISE EXCEPTION 'Missing table invoices'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bills';               IF NOT FOUND THEN RAISE EXCEPTION 'Missing table bills'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments';            IF NOT FOUND THEN RAISE EXCEPTION 'Missing table payments'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='purchase_orders';     IF NOT FOUND THEN RAISE EXCEPTION 'Missing table purchase_orders'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='stock_moves';         IF NOT FOUND THEN RAISE EXCEPTION 'Missing table stock_moves'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='manufacturing_orders';IF NOT FOUND THEN RAISE EXCEPTION 'Missing table manufacturing_orders'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='pos_receipts';        IF NOT FOUND THEN RAISE EXCEPTION 'Missing table pos_receipts'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='projects';            IF NOT FOUND THEN RAISE EXCEPTION 'Missing table projects'; END IF;
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='timesheets';          IF NOT FOUND THEN RAISE EXCEPTION 'Missing table timesheets'; END IF;

  m := v_start;
  WHILE m < v_end LOOP
    INSERT INTO invoices(tenantid,date,total,currency,status)
    SELECT v_tid,(date_trunc('month',m)+(g*2))::date, round((800+g*25+random()*100)::numeric,2),'GBP','POSTED'
    FROM generate_series(1,12) g;
    INSERT INTO purchase_orders(tenantid,date,total,currency,status)
    SELECT v_tid,(date_trunc('month',m)+(g*3))::date, round((500+g*20+random()*60)::numeric,2),'GBP','RECEIVED'
    FROM generate_series(1,10) g;
    INSERT INTO bills(tenantid,date,total,currency,status)
    SELECT v_tid,(date_trunc('month',m)+(g*3))::date, round((450+g*18+random()*50)::numeric,2),'GBP','POSTED'
    FROM generate_series(1,9) g;
    INSERT INTO payments(tenantid,date,amount,direction,method)
    SELECT v_tid,(date_trunc('month',m)+(g*2))::date, round((400+g*15+random()*80)::numeric,2),
           CASE WHEN g%3=0 THEN 'OUT' ELSE 'IN' END, CASE WHEN g%2=0 THEN 'CARD' ELSE 'BANK' END
    FROM generate_series(1,14) g;
    INSERT INTO stock_moves(tenantid,date,move_type,qty,unit_cost)
    SELECT v_tid,(date_trunc('month',m)+g)::date,
           CASE WHEN g%5=0 THEN 'ADJUST' WHEN g%2=0 THEN 'RECEIPT' ELSE 'ISSUE' END,
           (10+(random()*20))::int, round((12+(random()*3))::numeric,2)
    FROM generate_series(1,25) g;
    INSERT INTO manufacturing_orders(tenantid,start_date,end_date,qty_planned,qty_good,qty_scrap,status)
    SELECT v_tid,(date_trunc('month',m)+(g*4))::date,(date_trunc('month',m)+(g*4+3))::date,(50+g*2),(50+g*2-1),1,'CLOSED'
    FROM generate_series(1,6) g;
    INSERT INTO pos_receipts(tenantid,date,gross_total,tender,status)
    SELECT v_tid,(date_trunc('month',m)+g)::date, round((25+(random()*60))::numeric,2),
           CASE WHEN g%10<3 THEN 'CASH' ELSE 'CARD' END,'CLOSED'
    FROM generate_series(1,40) g;
    INSERT INTO projects(tenantid,name,start_date,end_date,status)
    SELECT v_tid,'Project-'||to_char(m,'YYYYMM')||'-'||g,
           date_trunc('month',m)+(g*2), date_trunc('month',m)+(g*2+15),'ACTIVE'
    FROM generate_series(1,3) g;
    INSERT INTO timesheets(tenantid,work_date,hours,billable)
    SELECT v_tid,(date_trunc('month',m)+g)::date,(1+random()*7)::numeric(4,2),(g%4<>0)
    FROM generate_series(1,120) g;
    m := (m + interval '1 month')::date;
  END LOOP;
END;
$$;
SQL

cat > scripts/verify/verify-kpis.sql <<'SQL'
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
SQL

cat > tests/e2e/prod-login-and-kpis.spec.ts <<'TS'
import { test, expect, Page } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'https://app.nexaai.co.uk';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const SUPER_EMAIL = process.env.SUPER_ADMIN_EMAIL!;
const SUPER_PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await Promise.all([
    page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 30000 }),
    page.getByRole('button', { name: /sign in|login/i }).click(),
  ]);
  await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  await expect(page.locator('[data-testid="kpi-value"]').first()).toBeVisible();
}

test.describe('Production smokes', () => {
  test('Admin can login and see module lists populated', async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    for (const path of ['/finance/invoices','/inventory/stock-moves','/manufacturing/orders','/pos/receipts','/projects/timesheets']) {
      await page.goto(`${BASE_URL}${path}`);
      await expect(page.locator('[data-testid="list-row"]').first()).toBeVisible();
    }
  });
  test('Super admin can login and reach dashboard', async ({ page }) => {
    await login(page, SUPER_EMAIL, SUPER_PASSWORD);
  });
});
TS

chmod +x scripts/ops/master-seed-live.sh

# Approve builds then run
pnpm approve-builds prisma @prisma/client @prisma/engines || true

PRISMA_SCHEMA_PATH="$PRISMA_SCHEMA_PATH" \
DATABASE_URL="$DATABASE_URL" \
BASE_URL="$BASE_URL" \
SUPER_ADMIN_EMAIL="$SUPER_ADMIN_EMAIL" SUPER_ADMIN_PASSWORD="$SUPER_ADMIN_PASSWORD" \
ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" \
TENANT_CODE="$TENANT_CODE" TENANT_NAME="$TENANT_NAME" \
./scripts/ops/master-seed-live.sh

LATEST_REPORT=$(ls -td reports/data-seed-* 2>/dev/null | head -n1)
echo "[done] Evidence: $LATEST_REPORT"
