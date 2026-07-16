-- ============================================================
-- EdosPoa – Complete Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ============================================================
-- PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                       -- Basic | Pro | Enterprise
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_semiannual NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_branches INT NOT NULL DEFAULT 1,
  max_users INT NOT NULL DEFAULT 3,
  max_products INT NOT NULL DEFAULT 100,
  features JSONB NOT NULL DEFAULT '[]',
  stripe_monthly_price_id TEXT,
  stripe_semiannual_price_id TEXT,
  stripe_yearly_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  plan_id UUID REFERENCES public.plans(id),
  owner_email TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL DEFAULT 'KE',
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  -- White-label
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563EB',
  secondary_color TEXT NOT NULL DEFAULT '#7C3AED',
  -- Status & billing
  status TEXT NOT NULL DEFAULT 'trial'
    CHECK (status IN ('trial','active','grace_period','suspended','cancelled')),
  trial_ends_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  -- Receipt & invoice config
  receipt_header TEXT,
  receipt_footer TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  receipt_prefix TEXT DEFAULT 'RCP',
  -- Tax config
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  tax_rate NUMERIC(5,2) DEFAULT 16,
  tax_name TEXT DEFAULT 'VAT',
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly','semiannual','yearly')),
  payment_method TEXT NOT NULL DEFAULT 'stripe'
    CHECK (payment_method IN ('stripe','mpesa','manual')),
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_method_id TEXT,
  -- M-Pesa
  mpesa_phone TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','past_due','cancelled','unpaid','trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  -- Pricing snapshot
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  -- Payment tracking
  last_payment_at TIMESTAMPTZ,
  last_payment_amount NUMERIC(10,2),
  failed_payment_count INT NOT NULL DEFAULT 0,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','void')),
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  mpesa_receipt TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = super admin
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff'
    CHECK (role IN ('super_admin','owner','manager','cashier','staff')),
  branch_id UUID,  -- FK added after branches table
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BRANCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from profiles to branches
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  notes TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  category_id UUID REFERENCES public.categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 10,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX products_sku_tenant_idx ON public.products(tenant_id, sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX products_barcode_tenant_idx ON public.products(tenant_id, barcode) WHERE barcode IS NOT NULL;

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  loyalty_points INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  customer_id UUID REFERENCES public.customers(id),
  cashier_id UUID REFERENCES public.profiles(id),
  receipt_number TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash'
    CHECK (payment_method IN ('cash','mpesa','card','credit','split')),
  payment_status TEXT NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('paid','pending','partial','refunded')),
  mpesa_receipt TEXT,
  mpesa_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SALE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  receipt_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STOCK ADJUSTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  type TEXT NOT NULL CHECK (type IN ('in','out','adjustment','return')),
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reason TEXT,
  reference TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MPESA TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  checkout_request_id TEXT UNIQUE,
  merchant_request_id TEXT,
  mpesa_receipt TEXT UNIQUE,
  phone TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'sale'
    CHECK (type IN ('sale','subscription','refund')),
  reference_id UUID,         -- sale_id or subscription_id
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed','cancelled')),
  result_code INT,
  result_desc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'plans','tenants','subscriptions','profiles','branches',
    'categories','suppliers','products','customers','sales',
    'mpesa_transactions'
  ]
  LOOP
    EXECUTE FORMAT(
      'CREATE OR REPLACE TRIGGER set_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGN-UP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CUSTOM JWT CLAIMS (tenant_id, role, subdomain)
-- ============================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  profile_row public.profiles%ROWTYPE;
  tenant_row public.tenants%ROWTYPE;
BEGIN
  claims := event->'claims';

  SELECT * INTO profile_row
  FROM public.profiles
  WHERE id = (event->>'user_id')::UUID;

  IF profile_row.id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(profile_row.tenant_id));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(profile_row.role));

    IF profile_row.tenant_id IS NOT NULL THEN
      SELECT subdomain INTO tenant_row
      FROM public.tenants
      WHERE id = profile_row.tenant_id;

      claims := jsonb_set(claims, '{subdomain}', to_jsonb(tenant_row.subdomain));
    END IF;
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a super admin?
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt()->'user_role')::TEXT = '"super_admin"',
    FALSE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: current user's tenant_id from JWT
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
  SELECT NULLIF((auth.jwt()->>'tenant_id'), '')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---- PLANS (public read, super admin write) ----
CREATE POLICY "plans_public_read" ON public.plans
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "plans_super_admin_all" ON public.plans
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- TENANTS ----
CREATE POLICY "tenants_super_admin" ON public.tenants
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "tenants_own" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());

CREATE POLICY "tenants_owner_update" ON public.tenants
  FOR UPDATE TO authenticated
  USING (id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"'));

-- ---- SUBSCRIPTIONS ----
CREATE POLICY "subscriptions_super_admin" ON public.subscriptions
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "subscriptions_own_tenant" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- ---- INVOICES ----
CREATE POLICY "invoices_super_admin" ON public.invoices
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "invoices_own_tenant" ON public.invoices
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- ---- PROFILES ----
CREATE POLICY "profiles_super_admin" ON public.profiles
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "profiles_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_same_tenant" ON public.profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_owner_manage" ON public.profiles
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

-- ---- BRANCHES ----
CREATE POLICY "branches_super_admin" ON public.branches
  FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "branches_own_tenant" ON public.branches
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "branches_owner_manage" ON public.branches
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

-- ---- CATEGORIES ----
CREATE POLICY "categories_own_tenant_read" ON public.categories
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "categories_owner_manage" ON public.categories
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

CREATE POLICY "categories_super_admin" ON public.categories
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- SUPPLIERS ----
CREATE POLICY "suppliers_own_tenant" ON public.suppliers
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "suppliers_owner_manage" ON public.suppliers
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

CREATE POLICY "suppliers_super_admin" ON public.suppliers
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- PRODUCTS ----
CREATE POLICY "products_own_tenant_read" ON public.products
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "products_staff_create" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "products_owner_manage" ON public.products
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

CREATE POLICY "products_super_admin" ON public.products
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- CUSTOMERS ----
CREATE POLICY "customers_own_tenant" ON public.customers
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "customers_staff_manage" ON public.customers
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "customers_super_admin" ON public.customers
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- SALES ----
CREATE POLICY "sales_own_tenant" ON public.sales
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "sales_cashier_create" ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "sales_super_admin" ON public.sales
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- SALE ITEMS ----
CREATE POLICY "sale_items_own_tenant" ON public.sale_items
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "sale_items_insert" ON public.sale_items
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "sale_items_super_admin" ON public.sale_items
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- EXPENSES ----
CREATE POLICY "expenses_own_tenant" ON public.expenses
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "expenses_staff_insert" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "expenses_owner_manage" ON public.expenses
  FOR ALL TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (auth.jwt()->>'user_role') IN ('"owner"', '"manager"')
  );

CREATE POLICY "expenses_super_admin" ON public.expenses
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- STOCK ADJUSTMENTS ----
CREATE POLICY "stock_own_tenant" ON public.stock_adjustments
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

CREATE POLICY "stock_staff_insert" ON public.stock_adjustments
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "stock_super_admin" ON public.stock_adjustments
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ---- MPESA TRANSACTIONS ----
CREATE POLICY "mpesa_own_tenant" ON public.mpesa_transactions
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY "mpesa_service_role" ON public.mpesa_transactions
  FOR ALL TO service_role USING (true);

-- ---- AUDIT LOGS ----
CREATE POLICY "audit_own_tenant" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY "audit_service_insert" ON public.audit_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- ============================================================
-- INVENTORY TRIGGER: auto-update stock on sale
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_updated INT;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id AND tenant_id = NEW.tenant_id AND track_inventory = true
      AND quantity >= NEW.quantity;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    -- If no row was updated because stock was insufficient (not because the
    -- product is untracked/missing), abort the sale so it can't oversell.
    IF v_updated = 0 AND EXISTS (
      SELECT 1 FROM public.products
      WHERE id = NEW.product_id AND tenant_id = NEW.tenant_id AND track_inventory = true
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id
        USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.stock_adjustments (
      tenant_id, product_id, type, quantity,
      previous_quantity, new_quantity, reason, reference
    )
    SELECT
      NEW.tenant_id,
      NEW.product_id,
      'out',
      NEW.quantity,
      p.quantity + NEW.quantity,
      p.quantity,
      'Sale',
      NEW.sale_id::TEXT
    FROM public.products p
    WHERE p.id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sale_item_inserted
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_sale();

-- ============================================================
-- UPDATE CUSTOMER STATS ON SALE
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_customer_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET
      total_spent = total_spent + NEW.total,
      loyalty_points = loyalty_points + FLOOR(NEW.total / 100)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sale_created
  AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_on_sale();

-- ============================================================
-- GENERATE RECEIPT NUMBER
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_count INT;
BEGIN
  SELECT receipt_prefix INTO v_prefix FROM public.tenants WHERE id = p_tenant_id;
  SELECT COUNT(*) + 1 INTO v_count FROM public.sales WHERE tenant_id = p_tenant_id;
  RETURN v_prefix || '-' || LPAD(v_count::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_sales_tenant ON public.sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout ON public.mpesa_transactions(checkout_request_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('logos', 'logos', true),
  ('receipts', 'receipts', false),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'logos');

CREATE POLICY "logos_tenant_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);

CREATE POLICY "products_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'products');

CREATE POLICY "products_tenant_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);
