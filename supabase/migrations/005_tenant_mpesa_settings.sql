-- ============================================================
-- Per-Tenant M-Pesa Integration Settings
-- Each tenant stores their own Safaricom Daraja credentials
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenant_mpesa_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  environment TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (environment IN ('sandbox', 'production')),
  consumer_key TEXT NOT NULL DEFAULT '',
  consumer_secret TEXT NOT NULL DEFAULT '',
  shortcode TEXT NOT NULL DEFAULT '',
  passkey TEXT NOT NULL DEFAULT '',
  -- Optional B2C fields for refunds
  initiator_name TEXT,
  security_credential TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at_tenant_mpesa_settings
  BEFORE UPDATE ON public.tenant_mpesa_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.tenant_mpesa_settings ENABLE ROW LEVEL SECURITY;

-- Super admin: full access
CREATE POLICY "mpesa_settings_super_admin" ON public.tenant_mpesa_settings
  FOR ALL TO authenticated
  USING (public.is_super_admin());

-- Tenant users: read their own settings only
CREATE POLICY "mpesa_settings_tenant_read" ON public.tenant_mpesa_settings
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- Owner/manager: insert their own settings
CREATE POLICY "mpesa_settings_owner_insert" ON public.tenant_mpesa_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

-- Owner/manager: update their own settings
CREATE POLICY "mpesa_settings_owner_update" ON public.tenant_mpesa_settings
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

-- Owner only: delete
CREATE POLICY "mpesa_settings_owner_delete" ON public.tenant_mpesa_settings
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') = '"owner"'
  );
