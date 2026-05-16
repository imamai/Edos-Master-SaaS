-- ============================================================
-- eTIMS Integration – KRA Electronic Tax Invoice Management
-- ============================================================

-- ── eTIMS settings per tenant ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenants_etims_settings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_enabled        BOOLEAN NOT NULL DEFAULT false,
  environment       TEXT NOT NULL DEFAULT 'sandbox'
    CHECK (environment IN ('sandbox', 'production')),

  -- KRA credentials (stored as provided – encrypt at app layer or use Vault)
  kra_pin           TEXT,            -- same as TIN e.g. P051234567A
  branch_id         TEXT NOT NULL DEFAULT '000',   -- bhfId (branch code)
  device_serial     TEXT NOT NULL DEFAULT 'VSCU001', -- dvcSrlNo (virtual SCU)

  -- Invoice sequence – MUST be monotonically increasing per tenant/branch
  next_invoice_no   BIGINT NOT NULL DEFAULT 1,

  -- Initialisation state
  initialized_at    TIMESTAMPTZ,
  init_response     JSONB,           -- raw response from selectInitOsdcInfo

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── eTIMS submitted invoices ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.etims_invoices (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sale_id           UUID NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,

  -- Sequence used in the submission
  etims_invoice_no  BIGINT NOT NULL,

  -- KRA response fields
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed', 'cancelled')),
  irn               TEXT,           -- Invoice Reference Number from KRA
  qr_code           TEXT,           -- QR code string/URL returned by KRA
  result_code       TEXT,           -- KRA resultCd ("000" = success)
  result_msg        TEXT,

  -- Full payload / response stored for audit
  request_payload   JSONB,
  response_payload  JSONB,

  submitted_at      TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Offline / retry queue ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.etims_queue (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sale_id           UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  idempotency_key   TEXT NOT NULL UNIQUE,   -- prevents double-submission

  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'done', 'failed')),

  attempt_count     INT NOT NULL DEFAULT 0,
  max_attempts      INT NOT NULL DEFAULT 5,
  last_error        TEXT,
  last_attempt_at   TIMESTAMPTZ,
  next_attempt_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Extend products with eTIMS classification ─────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS etims_item_cls_cd TEXT DEFAULT '10101501',
  ADD COLUMN IF NOT EXISTS etims_tax_type_cd TEXT NOT NULL DEFAULT 'B'
    CHECK (etims_tax_type_cd IN ('A','B','C','D','E'));
-- A=Exempt  B=16% VAT  C=Zero-rated  D=8% Special  E=Excise

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_etims_invoices_tenant   ON public.etims_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_etims_invoices_sale     ON public.etims_invoices(sale_id);
CREATE INDEX IF NOT EXISTS idx_etims_invoices_status   ON public.etims_invoices(status);
CREATE INDEX IF NOT EXISTS idx_etims_queue_tenant      ON public.etims_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_etims_queue_status      ON public.etims_queue(status);
CREATE INDEX IF NOT EXISTS idx_etims_queue_next_attempt ON public.etims_queue(next_attempt_at)
  WHERE status IN ('pending', 'failed');

-- ── updated_at triggers ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_etims_settings_updated_at ON public.tenants_etims_settings;
CREATE TRIGGER trg_etims_settings_updated_at
  BEFORE UPDATE ON public.tenants_etims_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_etims_invoices_updated_at ON public.etims_invoices;
CREATE TRIGGER trg_etims_invoices_updated_at
  BEFORE UPDATE ON public.etims_invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_etims_queue_updated_at ON public.etims_queue;
CREATE TRIGGER trg_etims_queue_updated_at
  BEFORE UPDATE ON public.etims_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Atomic invoice number allocation ─────────────────────────
-- Returns the next sequential invoice number and increments the counter.
-- Wrapped in a FOR UPDATE lock to prevent race conditions across concurrent sales.
CREATE OR REPLACE FUNCTION public.claim_etims_invoice_no(p_tenant_id UUID)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
  v_no BIGINT;
BEGIN
  SELECT next_invoice_no INTO v_no
    FROM public.tenants_etims_settings
   WHERE tenant_id = p_tenant_id
   FOR UPDATE;

  IF v_no IS NULL THEN
    RAISE EXCEPTION 'eTIMS not configured for tenant %', p_tenant_id;
  END IF;

  UPDATE public.tenants_etims_settings
     SET next_invoice_no = next_invoice_no + 1
   WHERE tenant_id = p_tenant_id;

  RETURN v_no;
END;
$$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.tenants_etims_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etims_invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etims_queue            ENABLE ROW LEVEL SECURITY;

-- Tenants can only see their own eTIMS data
CREATE POLICY etims_settings_tenant_isolation ON public.tenants_etims_settings
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY etims_invoices_tenant_isolation ON public.etims_invoices
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY etims_queue_tenant_isolation ON public.etims_queue
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- ── Cron: retry failed queue every 5 minutes ─────────────────
-- Requires pg_cron + pg_net extensions (already enabled in 001_initial_schema.sql)
-- Replace YOUR_SUPABASE_PROJECT_REF and YOUR_SERVICE_ROLE_KEY before running.
-- This is provided as reference – configure via Supabase Dashboard > Database > Cron Jobs.
-- SELECT cron.schedule(
--   'etims-retry-queue',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/etims-retry-queue',
--     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );
