-- ============================================================
-- Seed Data – Plans & Super Admin
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Plans
INSERT INTO public.plans (name, slug, description, price_monthly, price_semiannual, price_yearly, max_branches, max_users, max_products, features)
VALUES
  (
    'Basic', 'basic',
    'Perfect for small shops just getting started.',
    999, 5394, 9588,
    1, 3, 500,
    '["POS terminal","Inventory management","Sales reports","Email receipts","1 branch","3 staff users"]'::JSONB
  ),
  (
    'Pro', 'pro',
    'For growing businesses needing advanced features.',
    2499, 13494, 23988,
    3, 15, 5000,
    '["Everything in Basic","Multiple branches","M-Pesa STK Push","Customer loyalty","Barcode scanner","Advanced reports","15 staff users","Supplier management","Expense tracking","CSV/PDF exports"]'::JSONB
  ),
  (
    'Enterprise', 'enterprise',
    'Unlimited power for large retailers and chains.',
    5999, 32394, 59988,
    -1, -1, -1,
    '["Everything in Pro","Unlimited branches","Unlimited users","Unlimited products","White-label branding","Custom domain","API access","Priority support","Multi-warehouse","Franchise management"]'::JSONB
  )
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_semiannual = EXCLUDED.price_semiannual,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================================
-- HOW TO CREATE SUPER ADMIN:
-- 1. Sign up via Supabase Auth (or use invite) with your email
-- 2. Run the query below, replacing 'YOUR_USER_UUID':
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'super_admin', tenant_id = NULL
-- WHERE id = 'YOUR_USER_UUID';
