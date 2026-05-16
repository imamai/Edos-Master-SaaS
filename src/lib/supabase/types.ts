// Auto-generate this with: supabase gen types typescript --project-id YOUR_PROJECT_ID
// This is a simplified version — replace with the full generated output after running the migration

export type Database = {
  public: {
    Tables: {
      plans: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['plans']['Insert']>
      }
      tenants: {
        Row: {
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
          status: 'trial' | 'active' | 'grace_period' | 'suspended' | 'cancelled'
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
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'super_admin' | 'owner' | 'manager' | 'cashier' | 'staff'
          branch_id: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      products: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      sales: {
        Row: {
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
          payment_method: 'cash' | 'mpesa' | 'card' | 'credit' | 'split'
          payment_status: 'paid' | 'pending' | 'partial' | 'refunded'
          mpesa_receipt: string | null
          mpesa_phone: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sales']['Insert']>
      }
      customers: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      branches: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['branches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['branches']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: string
          billing_cycle: 'monthly' | 'semiannual' | 'yearly'
          payment_method: 'stripe' | 'mpesa' | 'manual'
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
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      expenses: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
      sale_items: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['sale_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>
      }
      suppliers: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      mpesa_transactions: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['mpesa_transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mpesa_transactions']['Insert']>
      }
      invoices: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          color: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      stock_adjustments: {
        Row: {
          id: string
          tenant_id: string
          product_id: string
          branch_id: string | null
          type: 'in' | 'out' | 'adjustment' | 'return'
          quantity: number
          previous_quantity: number
          new_quantity: number
          reason: string | null
          reference: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stock_adjustments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stock_adjustments']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_data: Record<string, unknown> | null
          new_data: Record<string, unknown> | null
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: never
      }
      tenants_etims_settings: {
        Row: {
          id: string
          tenant_id: string
          is_enabled: boolean
          environment: 'sandbox' | 'production'
          kra_pin: string | null
          branch_id: string
          device_serial: string
          next_invoice_no: number
          initialized_at: string | null
          init_response: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants_etims_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants_etims_settings']['Insert']>
      }
      etims_invoices: {
        Row: {
          id: string
          tenant_id: string
          sale_id: string
          etims_invoice_no: number
          status: 'pending' | 'submitted' | 'confirmed' | 'failed' | 'cancelled'
          irn: string | null
          qr_code: string | null
          result_code: string | null
          result_msg: string | null
          request_payload: Record<string, unknown> | null
          response_payload: Record<string, unknown> | null
          submitted_at: string | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['etims_invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['etims_invoices']['Insert']>
      }
      etims_queue: {
        Row: {
          id: string
          tenant_id: string
          sale_id: string
          idempotency_key: string
          status: 'pending' | 'processing' | 'done' | 'failed'
          attempt_count: number
          max_attempts: number
          last_error: string | null
          last_attempt_at: string | null
          next_attempt_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['etims_queue']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['etims_queue']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      current_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
      generate_receipt_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      claim_etims_invoice_no: {
        Args: { p_tenant_id: string }
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}
