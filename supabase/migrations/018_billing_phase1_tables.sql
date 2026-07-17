-- ============================================================
-- Billing Phase 1: net-new tables for the subscription/billing
-- system. Purely additive, no existing table/behaviour touched.
-- All four tables follow the read-only-for-tenants RLS pattern
-- established in migration 017 (subscriptions/invoices): tenants
-- can view their own rows, all writes go through service-role
-- backend routes/webhooks only.
-- ============================================================

-- Generic payment record across all billing rails (Stripe, M-Pesa,
-- bank transfer, manual). Deliberately separate from the POS `payments`
-- table, which is sale-scoped and has no tenant_id/subscription linkage.
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  method text NOT NULL CHECK (method IN ('stripe', 'mpesa', 'bank_transfer', 'manual')),
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider_reference text,
  proof_url text,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Idempotency guard: a given provider reference (Stripe payment intent,
-- M-Pesa receipt, bank ref) can only ever apply once.
CREATE UNIQUE INDEX subscription_payments_provider_reference_key
  ON public.subscription_payments (method, provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE INDEX subscription_payments_tenant_id_idx ON public.subscription_payments (tenant_id);
CREATE INDEX subscription_payments_subscription_id_idx ON public.subscription_payments (subscription_id);
CREATE INDEX subscription_payments_status_idx ON public.subscription_payments (status);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_payments_tenant_read ON public.subscription_payments
  FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_super_admin());

-- Outbound email delivery log (welcome, invoice, reminder, receipt, etc.)
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  recipient text NOT NULL,
  template text NOT NULL,
  subject text NOT NULL,
  provider_message_id text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_logs_tenant_id_idx ON public.email_logs (tenant_id);
CREATE INDEX email_logs_template_idx ON public.email_logs (template);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_logs_tenant_read ON public.email_logs
  FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_super_admin());

-- Reminder dedupe log: one row per (subscription, notification type,
-- billing period) so the daily cron never sends the same reminder twice
-- for the same renewal cycle.
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN (
    'reminder_30', 'reminder_14', 'reminder_7', 'reminder_3', 'reminder_1',
    'expiry', 'suspension'
  )),
  period_end timestamptz NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX notification_logs_dedupe_key
  ON public.notification_logs (subscription_id, notification_type, period_end);

CREATE INDEX notification_logs_tenant_id_idx ON public.notification_logs (tenant_id);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_logs_super_admin_read ON public.notification_logs
  FOR SELECT
  USING (is_super_admin());

-- Full audit trail of subscription lifecycle changes (created, renewed,
-- upgraded, downgraded, cancelled, suspended, reactivated, payment_recorded).
CREATE TABLE public.subscription_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('system', 'user', 'super_admin')),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscription_audit_logs_tenant_id_idx ON public.subscription_audit_logs (tenant_id);
CREATE INDEX subscription_audit_logs_subscription_id_idx ON public.subscription_audit_logs (subscription_id);

ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_audit_logs_tenant_read ON public.subscription_audit_logs
  FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_super_admin());

-- Configurable grace period per tenant (requirement: "Grace periods
-- configurable per tenant"). Default matches the 7-day value the
-- existing manual TenantActions admin flow already uses.
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS grace_period_days integer NOT NULL DEFAULT 7;
