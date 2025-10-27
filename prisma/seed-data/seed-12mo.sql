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
