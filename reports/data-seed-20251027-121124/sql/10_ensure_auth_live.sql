\set ON_ERROR_STOP on
DO $$
DECLARE
  v_tid text;
  v_root text;
BEGIN
  SELECT id INTO v_tid FROM public."Tenant" WHERE name = current_setting('app.tenant_name', true) LIMIT 1;
  IF v_tid IS NULL THEN
    v_tid := 'nexa_demo';
    INSERT INTO public."Tenant"("id", "name", "createdAt", "updatedAt")
    VALUES (v_tid, current_setting('app.tenant_name', true), now(), now());
  END IF;

  -- Prefer an existing root tenant for SUPER; fallback to v_tid
  SELECT id INTO v_root FROM public."Tenant" WHERE id IN ('tenant-root','nexa-root','root') LIMIT 1;
  IF v_root IS NULL THEN v_root := v_tid; END IF;

  -- SUPER: ensure with tenant_id
  INSERT INTO public."User"(id, email, password_hash, role, active, created_at, tenant_id)
  VALUES (current_setting('app.super_email',true), current_setting('app.super_email',true), current_setting('app.super_hash',true), 'SUPER_ADMIN', true, now(), v_root)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'SUPER_ADMIN', active = true, tenant_id = EXCLUDED.tenant_id;

  -- ADMIN: ensure with tenant_id v_tid
  INSERT INTO public."User"(id, email, password_hash, role, active, created_at, tenant_id)
  VALUES (current_setting('app.admin_email',true), current_setting('app.admin_email',true), current_setting('app.admin_hash',true), 'ADMIN', true, now(), v_tid)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'ADMIN', active = true, tenant_id = EXCLUDED.tenant_id;
END; $$;
