\set ON_ERROR_STOP on
DO $$
DECLARE
  v_tid text;
BEGIN
  SELECT id INTO v_tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1;
  IF v_tid IS NULL THEN
    v_tid := 'nexa_demo';
    INSERT INTO public."Tenant"(id, name, createdAt, updatedAt)
    VALUES (v_tid, current_setting('app.tenant_name', true), now(), now());
  END IF;

  INSERT INTO public."User"(email, password_hash, role, active, created_at)
  VALUES (current_setting('app.super_email',true), current_setting('app.super_hash',true), 'SUPER_ADMIN', true, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'SUPER_ADMIN', active = true;

  INSERT INTO public."User"(email, password_hash, role, active, created_at, tenant_id)
  VALUES (current_setting('app.admin_email',true), current_setting('app.admin_hash',true), 'ADMIN', true, now(), v_tid)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'ADMIN', active = true, tenant_id = EXCLUDED.tenant_id;
END; $$;
