export type TenantStatus = 'trial' | 'active' | 'grace_period' | 'suspended' | 'cancelled'
export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier' | 'staff'
export type BillingCycle = 'monthly' | 'semiannual' | 'yearly'
export type PaymentMethod = 'stripe' | 'mpesa' | 'manual'
export type SalePaymentMethod = 'cash' | 'mpesa' | 'card' | 'credit' | 'split'

export interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price_monthly: number
  price_semiannual: number
  price_yearly: number
  max_branches: number
  max_users: number
  max_products: number
  features: string[]
  stripe_monthly_price_id: string | null
  stripe_semiannual_price_id: string | null
  stripe_yearly_price_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  custom_domain: string | null
  plan_id: string | null
  owner_email: string
  owner_name: string
  phone: string | null
  country: string
  currency: string
  timezone: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  status: TenantStatus
  trial_ends_at: string | null
  grace_period_ends_at: string | null
  receipt_header: string | null
  receipt_footer: string | null
  invoice_prefix: string
  receipt_prefix: string
  tax_enabled: boolean
  tax_rate: number
  tax_name: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // joined
  plan?: Plan
  subscriptions?: Subscription[]
}

export interface Subscription {
  id: string
  tenant_id: string
  plan_id: string
  billing_cycle: BillingCycle
  payment_method: PaymentMethod
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_payment_method_id: string | null
  mpesa_phone: string | null
  status: 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  amount: number
  currency: string
  last_payment_at: string | null
  last_payment_amount: number | null
  failed_payment_count: number
  next_billing_date: string | null
  created_at: string
  updated_at: string
  plan?: Plan
}

export interface Profile {
  id: string
  tenant_id: string | null
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  branch_id: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  branch?: Branch
}

export interface Branch {
  id: string
  tenant_id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  is_main: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
  created_at: string
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  notes: string | null
  balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  branch_id: string | null
  category_id: string | null
  supplier_id: string | null
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  unit: string
  cost_price: number
  selling_price: number
  quantity: number
  low_stock_threshold: number
  image_url: string | null
  is_active: boolean
  track_inventory: boolean
  created_at: string
  updated_at: string
  category?: Category
  supplier?: Supplier
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  loyalty_points: number
  total_spent: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  tenant_id: string
  branch_id: string | null
  customer_id: string | null
  cashier_id: string | null
  receipt_number: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  amount_paid: number
  change_amount: number
  payment_method: SalePaymentMethod
  payment_status: 'paid' | 'pending' | 'partial' | 'refunded'
  mpesa_receipt: string | null
  mpesa_phone: string | null
  notes: string | null
  created_at: string
  items?: SaleItem[]
  customer?: Customer
  cashier?: Profile
}

export interface SaleItem {
  id: string
  sale_id: string
  tenant_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  discount: number
  total: number
  created_at: string
  product?: Product
}

export interface Expense {
  id: string
  tenant_id: string
  branch_id: string | null
  category: string
  description: string
  amount: number
  payment_method: string
  receipt_url: string | null
  date: string
  recorded_by: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  unit_price: number
  discount: number
  total: number
}

export interface MpesaTransaction {
  id: string
  tenant_id: string | null
  checkout_request_id: string | null
  merchant_request_id: string | null
  mpesa_receipt: string | null
  phone: string
  amount: number
  type: 'sale' | 'subscription' | 'refund'
  reference_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  result_code: number | null
  result_desc: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  tenant_id: string
  subscription_id: string | null
  invoice_number: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'void'
  due_date: string
  paid_at: string | null
  stripe_invoice_id: string | null
  mpesa_receipt: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface DashboardStats {
  total_sales_today: number
  total_revenue_today: number
  total_revenue_month: number
  total_transactions: number
  low_stock_count: number
  total_customers: number
  top_products: Array<{ name: string; quantity: number; revenue: number }>
  sales_by_hour: Array<{ hour: number; total: number }>
}

export interface AdminStats {
  total_tenants: number
  active_tenants: number
  trial_tenants: number
  suspended_tenants: number
  monthly_revenue: number
  total_revenue: number
  new_tenants_this_month: number
  churn_rate: number
}

// Supabase JWT custom claims
export interface CustomJWTClaims {
  tenant_id: string | null
  user_role: UserRole
  subdomain: string | null
}
