\set ON_ERROR_STOP on
DO $$
DECLARE
  v_tid text;
  v_supp text := 'supp-001';
  v_store text := 'store-001';
  v_shift text := 'shift-001';
  v_now date := (now() at time zone 'Europe/London')::date;
  v_end date := date_trunc('month', v_now)::date;
  v_start date := (v_end - interval '11 months')::date;
  m date;
  g int;
  inv_num text;
  sale_num text;
  inv_id text;
  sale_id text;
BEGIN
  SELECT id INTO v_tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1;
  IF v_tid IS NULL THEN RAISE EXCEPTION 'Tenant missing for seed'; END IF;

  m := v_start;
  WHILE m < v_end LOOP
    FOR g IN 1..12 LOOP
      inv_num := 'INV' || to_char(m, 'YYYYMM') || '-' || lpad(g::text, 3, '0');
      inv_id := 'inv-' || md5(inv_num || random()::text);
      INSERT INTO public."Invoice"("id", "tenantId", total, status, "currencyCode", "dueAt", "issuedAt", "number", "pdfHash")
      VALUES (inv_id, v_tid,
              round((800 + g*25 + (random()*100))::numeric,2), 'POSTED', 'GBP',
              (date_trunc('month', m) + interval '30 day')::date,
              (date_trunc('month', m) + (g*2))::date,
              inv_num,
              md5(inv_num || now()::text))
      ON CONFLICT ("number") DO NOTHING;

      INSERT INTO public."CustomerPayment"("id", "tenantId", "invoiceId", amount, "paidAt", method, reference, "createdAt", "updatedAt")
      VALUES ('pay-'||md5(inv_num||g::text), v_tid, inv_id,
              round((400 + g*15 + (random()*80))::numeric,2),
              (date_trunc('month', m) + (g*2))::date,
              CASE WHEN g%2=0 THEN 'card' ELSE 'bank' END,
              'PAY-'||inv_num, now(), now())
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOR g IN 1..9 LOOP
      INSERT INTO public."SupplierBill"("id", "tenantId", "number", "supplierId", currency, total, status, "receivedAt", "dueAt", "createdAt", "updatedAt")
      VALUES ('bill-'||md5(to_char(m,'YYYYMM')||g::text), v_tid,
              'BILL' || to_char(m,'YYYYMM') || '-' || lpad(g::text,3,'0'),
              v_supp,
              'GBP', round((450 + g*18 + (random()*50))::numeric,2), 'POSTED',
              (date_trunc('month', m) + (g*3))::date,
              (date_trunc('month', m) + (g*3+15))::date,
              now(), now())
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOR g IN 1..10 LOOP
      INSERT INTO public."PurchaseOrder"("id", "supplierId", currency, "createdAt", "updatedAt", "expectedAt", "number", "orderDate", "tenantId", status)
      VALUES ('po-'||md5(to_char(m,'YYYYMM')||g::text), v_supp, 'GBP', now(), now(),
              (date_trunc('month', m) + (g*3+7))::date,
              'PO' || to_char(m,'YYYYMM') || '-' || lpad(g::text,3,'0'),
              (date_trunc('month', m) + (g*3))::date,
              v_tid,
              'received'::"PoStatus")
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOR g IN 1..40 LOOP
      sale_num := 'POS' || to_char(m,'YYYYMM') || '-' || lpad(g::text,4,'0');
      sale_id := 'sale-'||md5(sale_num||random()::text);
      INSERT INTO public."PosSale"("id", "tenantId", "storeId", "shiftId", "cashierUserId", "saleNumber", status, subtotal, tax, total, currency, "createdAt")
      VALUES (sale_id, v_tid, v_store, v_shift,
              (SELECT id FROM public."User" WHERE email=current_setting('app.super_email',true) LIMIT 1),
              sale_num,
              'paid'::"PosSaleStatus",
              round((20 + random()*50)::numeric,2),
              round((2 + random()*10)::numeric,2),
              round((25 + random()*60)::numeric,2),
              'GBP',
              (date_trunc('month', m) + g)::date)
      ON CONFLICT DO NOTHING;

      INSERT INTO public."PosPayment"("id", "tenantId", "saleId", method, amount, tip, "stripePaymentIntentId", "stripeChargeId", "createdAt")
      VALUES ('paypos-'||md5(sale_num||g::text), v_tid, sale_id,
              CASE WHEN g%10<3 THEN 'cash'::"PosPaymentMethod" ELSE 'card'::"PosPaymentMethod" END,
              round((25 + random()*60)::numeric,2),
              0,
              NULL, NULL,
              (date_trunc('month', m) + g)::date)
      ON CONFLICT DO NOTHING;
    END LOOP;

    m := (m + interval '1 month')::date;
  END LOOP;
END; $$;
