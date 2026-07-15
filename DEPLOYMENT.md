ate# EdosPoa – Deployment Guide

## Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (for card payments)
- A Safaricom Daraja account (for M-Pesa)
- A Vercel account (recommended for hosting)
- Domain: `edos.co.ke` (or your own)

---

## Step 1 – Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to Kenya (e.g., EU West or US East until Africa is available)
3. Note your **Project URL** and **anon key** (Settings → API)

### 1.2 Run Migrations
1. Go to Supabase Dashboard → SQL Editor → New Query
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click Run
4. Paste and run `supabase/seed.sql` to add plans

### 1.3 Configure JWT Hook
1. Go to Supabase Dashboard → Authentication → Hooks
2. Add a new hook: **"custom_access_token"**
3. Select: PostgreSQL function → `public.custom_access_token_hook`
4. Save

### 1.4 Create Super Admin
1. Sign up at your app's `/register` page (or directly via Supabase Auth)
2. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles
SET role = 'super_admin', tenant_id = NULL
WHERE email = 'your-admin@email.com';
```

---

## Step 2 – Stripe Setup

### 2.1 Create Products & Prices
In Stripe Dashboard → Products, create:

| Product | Monthly Price | Semi-annual Price | Yearly Price |
|---------|-------------|-------------------|-------------|
| Basic   | KES 999     | KES 5,394         | KES 9,588   |
| Pro     | KES 2,499   | KES 13,494        | KES 23,988  |
| Enterprise | KES 5,999 | KES 32,394       | KES 59,988  |

### 2.2 Update Price IDs in Database
```sql
UPDATE public.plans SET
  stripe_monthly_price_id = 'price_xxx',
  stripe_semiannual_price_id = 'price_xxx',
  stripe_yearly_price_id = 'price_xxx'
WHERE slug = 'basic';
-- Repeat for pro and enterprise
```

### 2.3 Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://edos.co.ke/api/webhooks/stripe`
3. Events to listen for:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy the **Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 3 – M-Pesa Daraja Setup

### 3.1 Create Daraja App
1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app and note Consumer Key & Secret
3. For sandbox, use the test credentials provided
4. For production, go through Safaricom's Go-Live process

### 3.2 Register Callback URL
```
https://edos.co.ke/api/webhooks/mpesa
```

### 3.3 Sandbox Test Credentials
```
Shortcode: 174379
Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
Test Phone: 254708374149
```

---

## Step 4 – Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.local.example .env.local

# 3. Run the development server
npm run dev

# 4. For subdomain testing locally, edit /etc/hosts (Mac/Linux):
# 127.0.0.1 edos.localhost
# 127.0.0.1 admin.localhost
# 127.0.0.1 testbiz.localhost

# 5. Test M-Pesa webhooks locally with ngrok:
# ngrok http 3000
# Update MPESA_CALLBACK_URL in Daraja dashboard
```

---

## Step 5 – Vercel Deployment

### 5.1 Connect Repository
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set Framework: Next.js

### 5.2 Environment Variables
Add all variables from `.env.local.example` to Vercel:
- Project Settings → Environment Variables

### 5.3 Wildcard Domain Setup
1. Vercel Project Settings → Domains
2. Add `edos.co.ke` as your primary domain
3. Add `*.edos.co.ke` as a wildcard domain
4. Update your DNS:
   ```
   A     edos.co.ke        → Vercel IP (76.76.21.21)
   CNAME *.edos.co.ke      → cname.vercel-dns.com
   ```
5. Wait for SSL certificate to provision (~5 minutes)

### 5.4 Verify Routing
- `edos.co.ke` → Landing page ✓
- `admin.edos.co.ke` → Super admin (after login) ✓
- `testbiz.edos.co.ke` → Tenant POS (after registration) ✓

---

## Step 6 – Post-Deployment Checklist

- [ ] Supabase JWT Hook is enabled
- [ ] Super admin account created
- [ ] Stripe prices linked to plans in DB
- [ ] Stripe webhook endpoint verified
- [ ] M-Pesa callback URL registered and verified
- [ ] Wildcard SSL is working (`*.edos.co.ke`)
- [ ] Test a complete sale: add to cart → M-Pesa STK Push → confirm payment
- [ ] Test a complete subscription: register → choose plan → pay via Stripe

---

## Architecture Overview

```
Browser: client1.edos.co.ke
         ↓
Vercel Edge (Wildcard DNS)
         ↓
Next.js Middleware (src/middleware.ts)
  ├─ Detects subdomain: "client1"
  ├─ Queries Supabase: SELECT * FROM tenants WHERE subdomain = 'client1'
  ├─ Rewrites URL internally: /tenant/*
  └─ Sets x-tenant-* headers
         ↓
src/app/tenant/* (Server Components + Client Components)
  ├─ Reads tenant context from headers
  ├─ RLS enforced by Supabase (tenant_id from JWT)
  └─ Renders branded POS interface
```

---

## Monitoring & Maintenance

### Auto Grace Period
When Stripe payment fails, the system automatically:
1. First failure → tenant status: `grace_period` (7 days)
2. Third failure → tenant status: `suspended`
3. Payment recovered → tenant status: `active`

### Extending Grace Period
```sql
UPDATE public.tenants
SET grace_period_ends_at = NOW() + INTERVAL '14 days'
WHERE id = 'tenant-uuid';
```

### Manually Activating a Tenant
```sql
UPDATE public.tenants SET status = 'active' WHERE id = 'tenant-uuid';
UPDATE public.subscriptions SET status = 'active' WHERE tenant_id = 'tenant-uuid';
```

---

## Support

- Email: support@edos.co.ke
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Daraja API Docs: https://developer.safaricom.co.ke/docs
