-- create tenant_keys if it does not exist (for Prisma P1014 fix)
CREATE TABLE IF NOT EXISTS public.tenant_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    key text NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT tenant_keys_tenant_fk FOREIGN KEY (tenant_id)
        REFERENCES public."Tenant"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tenant_keys_tenant_id ON public.tenant_keys(tenant_id);
