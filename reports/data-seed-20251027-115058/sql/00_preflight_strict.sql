\set ON_ERROR_STOP on
DO $$
DECLARE
  -- helper to assert table and column presence
  PROCEDURE assert_table(tname text) LANGUAGE plpgsql AS $p$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tname) THEN
      RAISE EXCEPTION 'Missing table public."%"', tname;
    END IF;
  END $p$;

  PROCEDURE assert_col(tname text, cname text) LANGUAGE plpgsql AS $p$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tname AND column_name=cname) THEN
      RAISE EXCEPTION 'Missing column %.% (public."%".%)', tname, cname, tname, cname;
    END IF;
  END $p$;

  FUNCTION tenant_fk(tname text) RETURNS text LANGUAGE plpgsql AS $f$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tname AND column_name='tenantId') THEN
      RETURN 'tenantId';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=tname AND column_name='tenant_id') THEN
      RETURN 'tenant_id';
    ELSE
      RAISE EXCEPTION 'Missing tenant FK on % (expected tenantId or tenant_id)', tname;
    END IF;
  END $f$;

  v_fk text;
BEGIN
  -- Tenant + User (auth)
  PERFORM assert_table('Tenant');
  -- Accept either (code) or only (name); seed handles both
  PERFORM assert_col('Tenant','name');

  PERFORM assert_table('User');
  PERFORM assert_col('User','email');
  -- password column may be password_hash or password
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name IN ('password_hash','password')) THEN
    RAISE EXCEPTION 'Missing password column on public."User" (expected password_hash or password)';
  END IF;
  PERFORM assert_col('User','role');

  -- Core modules (STRICT)
  -- Invoice
  PERFORM assert_table('Invoice');
  v_fk := tenant_fk('Invoice');
  PERFORM assert_col('Invoice','date');
  PERFORM assert_col('Invoice','total');
  PERFORM assert_col('Invoice','currency');
  PERFORM assert_col('Invoice','status');

  -- SupplierBill
  PERFORM assert_table('SupplierBill');
  v_fk := tenant_fk('SupplierBill');
  PERFORM assert_col('SupplierBill','date');
  PERFORM assert_col('SupplierBill','total');
  PERFORM assert_col('SupplierBill','currency');
  PERFORM assert_col('SupplierBill','status');

  -- CustomerPayment
  PERFORM assert_table('CustomerPayment');
  v_fk := tenant_fk('CustomerPayment');
  PERFORM assert_col('CustomerPayment','date');
  PERFORM assert_col('CustomerPayment','amount');
  PERFORM assert_col('CustomerPayment','method');

  -- PurchaseOrder
  PERFORM assert_table('PurchaseOrder');
  v_fk := tenant_fk('PurchaseOrder');
  PERFORM assert_col('PurchaseOrder','date');
  PERFORM assert_col('PurchaseOrder','total');
  PERFORM assert_col('PurchaseOrder','currency');
  PERFORM assert_col('PurchaseOrder','status');

  -- POS
  PERFORM assert_table('PosSale');
  v_fk := tenant_fk('PosSale');
  PERFORM assert_col('PosSale','date');
  PERFORM assert_col('PosSale','gross_total');
  PERFORM assert_col('PosSale','tender');
  PERFORM assert_col('PosSale','status');

  -- Optional extended modules (STRICT as requested)
  PERFORM assert_table('StockMove');
  v_fk := tenant_fk('StockMove');
  PERFORM assert_col('StockMove','date');
  PERFORM assert_col('StockMove','move_type');
  PERFORM assert_col('StockMove','qty');
  PERFORM assert_col('StockMove','unit_cost');

  PERFORM assert_table('ManufacturingOrder');
  v_fk := tenant_fk('ManufacturingOrder');
  PERFORM assert_col('ManufacturingOrder','start_date');
  PERFORM assert_col('ManufacturingOrder','end_date');
  PERFORM assert_col('ManufacturingOrder','qty_planned');
  PERFORM assert_col('ManufacturingOrder','qty_good');
  PERFORM assert_col('ManufacturingOrder','qty_scrap');
  PERFORM assert_col('ManufacturingOrder','status');

  PERFORM assert_table('Project');
  v_fk := tenant_fk('Project');
  PERFORM assert_col('Project','name');
  PERFORM assert_col('Project','start_date');
  PERFORM assert_col('Project','end_date');
  PERFORM assert_col('Project','status');

  PERFORM assert_table('Timesheet');
  v_fk := tenant_fk('Timesheet');
  PERFORM assert_col('Timesheet','work_date');
  PERFORM assert_col('Timesheet','hours');
  PERFORM assert_col('Timesheet','billable');
END;
$$;
