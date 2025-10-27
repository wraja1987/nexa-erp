\set ON_ERROR_STOP on
DO $$
DECLARE
  v_tid text;
  v_store text;
BEGIN
  SELECT id INTO v_tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1;
  IF v_tid IS NULL THEN RAISE EXCEPTION 'Tenant missing'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public."Supplier" WHERE "tenantId"=v_tid AND code='SUPP001') THEN
    INSERT INTO public."Supplier"("id", "tenantId", code, name, "createdAt", "updatedAt")
    VALUES ('supp-001', v_tid, 'SUPP001', 'Default Supplier', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public."Store" WHERE "tenantId"=v_tid AND code='STORE001') THEN
    INSERT INTO public."Store"("id", "tenantId", name, code, timezone, "createdAt", "updatedAt")
    VALUES ('store-001', v_tid, 'Main Store', 'STORE001', 'Europe/London', now(), now());
  END IF;

  SELECT id INTO v_store FROM public."Store" WHERE "tenantId"=v_tid AND code='STORE001' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public."TillShift" WHERE "tenantId"=v_tid AND "storeId"=v_store AND status='open'::"TillShiftStatus") THEN
    INSERT INTO public."TillShift"("id", "tenantId", "storeId", "openedByUserId", "openedAt", "openingFloat", status)
    VALUES ('shift-001', v_tid, v_store, (SELECT id FROM public."User" WHERE email=current_setting('app.super_email',true) LIMIT 1), now(), 0, 'open'::"TillShiftStatus");
  END IF;
END; $$;
