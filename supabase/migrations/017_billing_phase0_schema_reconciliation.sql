-- ============================================================
-- Billing Phase 0: reconcile subscriptions/invoices schema with
-- what the existing Stripe webhook (src/app/api/webhooks/stripe/route.ts)
-- already assumes, add tenant-read-only RLS (subscriptions/invoices
-- currently have RLS enabled with ZERO policies — service_role only),
-- and backfill a subscriptions row for every tenant that's missing one
-- so the future reminder engine has consistent data for all tenants.
-- Pure bugfix + additive data reconciliation — no tenant.status or
-- enforcement behaviour changes here.
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS last_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS failed_payment_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS due_date timestamptz;

-- Tenants can view their own subscription/invoice rows; all writes
-- continue to go exclusively through service-role backend routes and
-- webhooks (never a tenant-authenticated client) — no write policy is
-- added on purpose, satisfying "tenants can never edit subscription
-- records" from day one.
CREATE POLICY subscriptions_tenant_read ON public.subscriptions
  FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_super_admin());

CREATE POLICY invoices_tenant_read ON public.invoices
  FOR SELECT
  USING (tenant_id = current_tenant_id() OR is_super_admin());

INSERT INTO public.subscriptions (tenant_id, plan_id, status, billing_cycle, current_period_start, current_period_end, amount, currency)
SELECT
  t.id,
  t.plan_id,
  CASE WHEN t.status = 'trial' THEN 'trialing' ELSE 'active' END,
  'monthly',
  t.created_at,
  COALESCE(t.trial_ends_at, t.created_at + interval '14 days'),
  COALESCE(p.price_monthly, 0),
  'KES'
FROM public.tenants t
LEFT JOIN public.plans p ON p.id = t.plan_id
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.tenant_id = t.id);
