-- ============================================================
-- EdosPoa – Multi-Tenant Migration for edos_db
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- This converts an existing single-tenant edos_db into the
-- multi-tenant umbrella. It never drops existing tables —
-- it only adds columns, new tables, and rewrites RLS policies.
-- ============================================================

-- ── STEP 1: HELPER FUNCTIONS ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- JWT claims hook — register in Supabase Dashboard → Auth → Hooks
-- Hook type: "custom_access_token", function: public.custom_access_token_hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  claims jsonb;
  user_profile record;
BEGIN
  SELECT p.tenant_id, p.role, t.subdomain
  INTO user_profile
  FROM public.profiles p
  LEFT JOIN public.tenants t ON t.id = p.tenant_id
  WHERE p.id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_profile.tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_profile.tenant_id::text));
    claims := jsonb_set(claims, '{subdomain}',  to_jsonb(COALESCE(user_profile.subdomain, '')));
  END IF;

  IF user_profile.role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_profile.role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- Receipt number generator
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_tenant_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_count  integer;
  v_prefix text;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.sales WHERE tenant_id = p_tenant_id;
  SELECT UPPER(SUBSTRING(subdomain, 1, 3)) INTO v_prefix FROM public.tenants WHERE id = p_tenant_id;
  RETURN COALESCE(v_prefix, 'REC') || '-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD((v_count + 1)::text, 4, '0');
END;
$$;


-- ── STEP 2: PLANS TABLE (new — does not exist in edos_db) ────

CREATE TABLE IF NOT EXISTS public.plans (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT NOT NULL,
  slug                     TEXT NOT NULL UNIQUE,
  description              TEXT,
  price_monthly            NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_semiannual         NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly             NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_branches             INT  NOT NULL DEFAULT 1,
  max_users                INT  NOT NULL DEFAULT 3,
  max_products             INT  NOT NULL DEFAULT 100,
  features                 JSONB NOT NULL DEFAULT '[]',
  stripe_monthly_price_id  TEXT,
  stripe_semiannual_price_id TEXT,
  stripe_yearly_price_id   TEXT,
  is_active                BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.plans (name, slug, description, price_monthly, price_semiannual, price_yearly, max_users, max_branches, max_products, features)
VALUES
  ('Basic', 'basic', 'For small businesses starting out', 999, 5394, 9588, 3, 1, 500,
   '["POS Terminal","Inventory Management","Sales Reports","M-Pesa Payments","Customer Management","Receipt Printing"]'),
  ('Pro', 'pro', 'For growing businesses', 2499, 13494, 23988, 10, 3, 2000,
   '["Everything in Basic","Multi-Branch","Staff Management","Advanced Reports","Supplier Management","Expense Tracking","Purchase Orders","Quotations","Priority Support"]'),
  ('Enterprise', 'enterprise', 'For large enterprises', 5999, 32394, 59988, -1, -1, -1,
   '["Everything in Pro","Unlimited Users","Unlimited Branches","Custom Domain","API Access","Dedicated Support","White-label"]')
ON CONFLICT (slug) DO NOTHING;


-- ── STEP 3: TENANTS TABLE (new — does not exist in edos_db) ──

CREATE TABLE IF NOT EXISTS public.tenants (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  subdomain             TEXT NOT NULL UNIQUE,
  custom_domain         TEXT UNIQUE,
  plan_id               UUID REFERENCES public.plans(id),
  owner_email           TEXT NOT NULL DEFAULT '',
  owner_name            TEXT NOT NULL DEFAULT '',
  phone                 TEXT,
  country               TEXT NOT NULL DEFAULT 'KE',
  currency              TEXT NOT NULL DEFAULT 'KES',
  timezone              TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  logo_url              TEXT,
  primary_color         TEXT NOT NULL DEFAULT '#2563EB',
  receipt_header        TEXT,
  receipt_footer        TEXT,
  tax_enabled           BOOLEAN NOT NULL DEFAULT false,
  tax_rate              NUMERIC(5,2)  DEFAULT 16,
  tax_name              TEXT          DEFAULT 'VAT',
  status                TEXT NOT NULL DEFAULT 'trial'
                          CHECK (status IN ('trial','active','grace_period','suspended','cancelled')),
  trial_ends_at         TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  grace_period_ends_at  TIMESTAMPTZ,
  stripe_customer_id    TEXT,
  payment_failure_count INT  NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_tenants"  ON public.tenants;
DROP POLICY IF EXISTS "tenant_read_own"           ON public.tenants;
DROP POLICY IF EXISTS "tenant_update_own"         ON public.tenants;

CREATE POLICY "super_admin_all_tenants" ON public.tenants FOR ALL    USING (public.is_super_admin());
CREATE POLICY "tenant_read_own"         ON public.tenants FOR SELECT USING (id = public.current_tenant_id());
CREATE POLICY "tenant_update_own"       ON public.tenants FOR UPDATE USING (id = public.current_tenant_id());

CREATE OR REPLACE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── STEP 4: SUBSCRIPTIONS TABLE (new) ────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id                 UUID REFERENCES public.plans(id),
  status                  TEXT NOT NULL DEFAULT 'active',
  billing_cycle           TEXT CHECK (billing_cycle IN ('monthly','semiannual','yearly')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  amount                  NUMERIC(10,2),
  currency                TEXT DEFAULT 'KES',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_subs"  ON public.subscriptions;
DROP POLICY IF EXISTS "tenant_read_own_sub"   ON public.subscriptions;

CREATE POLICY "super_admin_all_subs" ON public.subscriptions FOR ALL    USING (public.is_super_admin());
CREATE POLICY "tenant_read_own_sub"  ON public.subscriptions FOR SELECT USING (tenant_id = public.current_tenant_id());


-- ── STEP 5: INVOICES TABLE (new) ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id     UUID REFERENCES public.subscriptions(id),
  stripe_invoice_id   TEXT UNIQUE,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT DEFAULT 'KES',
  status              TEXT DEFAULT 'paid',
  billing_reason      TEXT,
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_invoices" ON public.invoices;
DROP POLICY IF EXISTS "tenant_read_own_inv"      ON public.invoices;

CREATE POLICY "super_admin_all_invoices" ON public.invoices FOR ALL    USING (public.is_super_admin());
CREATE POLICY "tenant_read_own_inv"      ON public.invoices FOR SELECT USING (tenant_id = public.current_tenant_id());


-- ── STEP 6: ADD tenant_id TO ALL EXISTING TABLES ─────────────
-- Using ADD COLUMN IF NOT EXISTS — safe to re-run

-- branches
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS city TEXT;

-- profiles: add tenant_id + subdomain; widen role constraint
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin','owner','admin','manager','cashier','storekeeper'));

-- categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- products: add stock columns used by new POS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tenant_id          UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity           NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INT    DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS track_inventory    BOOLEAN DEFAULT true;

-- suppliers: contact_name alias + extra columns expected by new UI
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS tenant_id     UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS contact_name  TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS city          TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS notes         TEXT;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS balance       NUMERIC DEFAULT 0;

-- customers: add total_spent
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id    UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent  NUMERIC DEFAULT 0;

-- sales: add tenant_id + payment_status for M-Pesa pending flow
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS tenant_id       UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_status  TEXT DEFAULT 'paid'
  CHECK (payment_status IN ('pending','paid','failed'));

-- mpesa_transactions
ALTER TABLE public.mpesa_transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- expenses: add text category for master schema compat (keep category_id FK)
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS category  TEXT;

-- stock_movements
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- audit_logs
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- purchase_orders (bonus — keep it)
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- quotations (bonus — keep it)
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- held_sales (bonus — keep it)
ALTER TABLE public.held_sales ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- eod_closures (bonus — keep it)
ALTER TABLE public.eod_closures ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- inventory (bonus — keep it; products.quantity is the canonical stock for new POS)
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;


-- ── STEP 7: CREATE THE FIRST TENANT & BACKFILL DATA ──────────
-- ⚠️  EDIT the values marked ← CHANGE THIS before running.

DO $$
DECLARE
  v_tenant_id UUID;
  v_plan_id   UUID;
BEGIN
  SELECT id INTO v_plan_id FROM public.plans WHERE slug = 'pro' LIMIT 1;

  INSERT INTO public.tenants (
    name, subdomain, owner_email, owner_name, plan_id, status, trial_ends_at
  ) VALUES (
    'EDOS CENTRE',       -- ← CHANGE THIS (business display name)
    'edoscentre.co.ke',             -- ← CHANGE THIS (subdomain: mybusiness.edos.co.ke)
    'info@edoscentre.co.ke',        -- ← CHANGE THIS (owner email)
    'Walter Imamai',             -- ← CHANGE THIS (owner full name)
    v_plan_id,
    'active',
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (subdomain) DO NOTHING
  RETURNING id INTO v_tenant_id;

  -- If tenant already existed (re-run safety)
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM public.tenants WHERE subdomain = 'mybusiness';
  END IF;

  -- ── Backfill tenant_id on all existing rows ──────────────
  UPDATE public.branches          SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.categories        SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.products          SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.suppliers         SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.customers         SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.sales             SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.mpesa_transactions SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.expenses          SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.stock_movements   SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.audit_logs        SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.purchase_orders   SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.quotations        SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.held_sales        SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.eod_closures      SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.inventory         SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;

  -- profiles: all non-super_admin users belong to this tenant
  UPDATE public.profiles
  SET tenant_id = v_tenant_id
  WHERE tenant_id IS NULL AND role != 'super_admin';

  -- ── Map old roles to new roles ───────────────────────────
  -- 'admin' → 'owner' (the business owner)
  UPDATE public.profiles SET role = 'owner' WHERE role = 'admin' AND tenant_id = v_tenant_id;
  -- 'storekeeper' → 'cashier' (closest equivalent; adjust if needed)
  -- UPDATE public.profiles SET role = 'cashier' WHERE role = 'storekeeper' AND tenant_id = v_tenant_id;

  -- ── Copy contact_person → contact_name for suppliers ────
  UPDATE public.suppliers
  SET contact_name = contact_person
  WHERE contact_name IS NULL AND contact_person IS NOT NULL;

  -- ── Migrate inventory quantities → products.quantity ─────
  -- Takes the quantity from the main branch's inventory record
  UPDATE public.products p
  SET quantity = COALESCE(
    (SELECT i.quantity FROM public.inventory i
     WHERE i.product_id = p.id
     ORDER BY i.last_updated DESC
     LIMIT 1),
    0
  )
  WHERE p.tenant_id = v_tenant_id AND (p.quantity IS NULL OR p.quantity = 0);

  -- ── Migrate expense category names → expenses.category ──
  UPDATE public.expenses e
  SET category = (SELECT ec.name FROM public.expense_categories ec WHERE ec.id = e.category_id)
  WHERE e.category IS NULL AND e.category_id IS NOT NULL;

  -- ── Create initial subscription record ──────────────────
  INSERT INTO public.subscriptions (tenant_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
  VALUES (v_tenant_id, v_plan_id, 'active', 'monthly', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT DO NOTHING;

END $$;


-- ── STEP 8: REWRITE ALL RLS POLICIES ─────────────────────────
-- Drops every existing policy per table and creates the
-- single multi-tenant policy that isolates by tenant_id.

-- Helper: drop all policies on a table
DO $$
DECLARE
  tbl text;
  pol text;
BEGIN
  FOR tbl IN SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
    END LOOP;
  END LOOP;
END $$;

-- branches
CREATE POLICY "tenant_branches" ON public.branches FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- profiles
CREATE POLICY "tenant_profiles" ON public.profiles FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin() OR id = auth.uid());

-- categories
CREATE POLICY "tenant_categories" ON public.categories FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- products
CREATE POLICY "tenant_products" ON public.products FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- inventory (bonus table)
CREATE POLICY "tenant_inventory" ON public.inventory FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- stock_movements
CREATE POLICY "tenant_stock_movements" ON public.stock_movements FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- customers
CREATE POLICY "tenant_customers" ON public.customers FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- suppliers
CREATE POLICY "tenant_suppliers" ON public.suppliers FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- sales
CREATE POLICY "tenant_sales" ON public.sales FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- sale_items (no tenant_id — access via sales join)
CREATE POLICY "tenant_sale_items" ON public.sale_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.tenant_id = public.current_tenant_id())
    OR public.is_super_admin()
  );

-- payments (bonus table — access via sales join)
CREATE POLICY "tenant_payments" ON public.payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.tenant_id = public.current_tenant_id())
    OR public.is_super_admin()
  );

-- mpesa_transactions
CREATE POLICY "tenant_mpesa" ON public.mpesa_transactions FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- expenses
CREATE POLICY "tenant_expenses" ON public.expenses FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- expense_categories (global lookup table — any authenticated user can read)
CREATE POLICY "auth_expense_categories_read"   ON public.expense_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "super_admin_expense_categories" ON public.expense_categories FOR ALL    USING (public.is_super_admin());

-- purchase_orders
CREATE POLICY "tenant_purchase_orders" ON public.purchase_orders FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- purchase_order_items (access via purchase_orders join)
CREATE POLICY "tenant_po_items" ON public.purchase_order_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.purchase_orders po WHERE po.id = po_id AND po.tenant_id = public.current_tenant_id())
    OR public.is_super_admin()
  );

-- quotations
CREATE POLICY "tenant_quotations" ON public.quotations FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- quotation_items (access via quotations join)
CREATE POLICY "tenant_quotation_items" ON public.quotation_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND q.tenant_id = public.current_tenant_id())
    OR public.is_super_admin()
  );

-- held_sales
CREATE POLICY "tenant_held_sales" ON public.held_sales FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- eod_closures
CREATE POLICY "tenant_eod_closures" ON public.eod_closures FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- warranty_records (access via sales join)
CREATE POLICY "tenant_warranty_records" ON public.warranty_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.tenant_id = public.current_tenant_id())
    OR public.is_super_admin()
  );

-- audit_logs
CREATE POLICY "tenant_audit_logs" ON public.audit_logs FOR ALL
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- plans (public read, super_admin write)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read"  ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans_super_admin"  ON public.plans FOR ALL    USING (public.is_super_admin());

-- tenants (already created above)
-- subscriptions + invoices (already created above)


-- ── STEP 9: STORAGE BUCKETS ───────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('logos',    'logos',    true),
  ('receipts', 'receipts', false),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;


-- ── STEP 10: PROMOTE YOUR ADMIN TO SUPER ADMIN ───────────────
-- Run this AFTER the migration, replacing the email below:
--
-- UPDATE public.profiles
-- SET role = 'super_admin', tenant_id = NULL
-- WHERE email = 'your-admin@email.com';


-- ── SUMMARY OF WHAT THIS MIGRATION DOES ──────────────────────
-- ✅ Creates: plans, tenants, subscriptions, invoices tables
-- ✅ Adds: tenant_id to all 18 existing tables
-- ✅ Adds: products.quantity, low_stock_threshold, track_inventory
-- ✅ Adds: suppliers.contact_name (copy of contact_person)
-- ✅ Adds: customers.total_spent, sales.payment_status
-- ✅ Migrates: inventory.quantity → products.quantity
-- ✅ Migrates: expenses.category_id name → expenses.category text
-- ✅ Creates: JWT hook function + super admin helper functions
-- ✅ Creates: storage buckets (logos, receipts, products)
-- ✅ Backfills: all existing data under the first tenant record
-- ✅ Rewrites: all RLS policies with tenant isolation
-- ✅ Keeps: purchase_orders, quotations, held_sales, eod_closures,
--           inventory, payments, expense_categories, warranty_records
