export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_main: boolean | null
          name: string
          phone: string | null
          tenant_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name: string
          phone?: string | null
          tenant_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name?: string
          phone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          tenant_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          loyalty_points: number | null
          name: string
          notes: string | null
          outstanding_balance: number | null
          phone: string | null
          tenant_id: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
          name: string
          notes?: string | null
          outstanding_balance?: number | null
          phone?: string | null
          tenant_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          outstanding_balance?: number | null
          phone?: string | null
          tenant_id?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      eod_closures: {
        Row: {
          branch_id: string
          card_sales: number | null
          cash_in_drawer: number | null
          cash_sales: number | null
          cashier_id: string | null
          closure_date: string
          created_at: string | null
          credit_sales: number | null
          id: string
          mpesa_sales: number | null
          notes: string | null
          tenant_id: string | null
          total_refunds: number | null
          total_sales: number | null
          total_transactions: number | null
        }
        Insert: {
          branch_id: string
          card_sales?: number | null
          cash_in_drawer?: number | null
          cash_sales?: number | null
          cashier_id?: string | null
          closure_date: string
          created_at?: string | null
          credit_sales?: number | null
          id?: string
          mpesa_sales?: number | null
          notes?: string | null
          tenant_id?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_transactions?: number | null
        }
        Update: {
          branch_id?: string
          card_sales?: number | null
          cash_in_drawer?: number | null
          cash_sales?: number | null
          cashier_id?: string | null
          closure_date?: string
          created_at?: string | null
          credit_sales?: number | null
          id?: string
          mpesa_sales?: number | null
          notes?: string | null
          tenant_id?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eod_closures_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eod_closures_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eod_closures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      etims_invoices: {
        Row: {
          confirmed_at: string | null
          created_at: string
          etims_invoice_no: number
          id: string
          irn: string | null
          qr_code: string | null
          request_payload: Json | null
          response_payload: Json | null
          result_code: string | null
          result_msg: string | null
          sale_id: string
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          etims_invoice_no: number
          id?: string
          irn?: string | null
          qr_code?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          result_code?: string | null
          result_msg?: string | null
          sale_id: string
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          etims_invoice_no?: number
          id?: string
          irn?: string | null
          qr_code?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          result_code?: string | null
          result_msg?: string | null
          sale_id?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etims_invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      etims_queue: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          idempotency_key: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          sale_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          idempotency_key: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          sale_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          sale_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etims_queue_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etims_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string
          expense_date: string | null
          id: string
          payment_method: string | null
          recorded_by: string | null
          reference: string | null
          tenant_id: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference?: string | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          branch_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          grn_number: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          received_by: string | null
          received_date: string
          status: string
          supplier_id: string | null
          supplier_invoice_ref: string | null
          tenant_id: string
          total_cost: number
          updated_at: string
          vat_amount: number
        }
        Insert: {
          branch_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          grn_number: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: string
          supplier_id?: string | null
          supplier_invoice_ref?: string | null
          tenant_id: string
          total_cost?: number
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          branch_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          grn_number?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          status?: string
          supplier_id?: string | null
          supplier_invoice_ref?: string | null
          tenant_id?: string
          total_cost?: number
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_items: {
        Row: {
          batch_number: string | null
          created_at: string
          damaged_qty: number
          expiry_date: string | null
          grn_id: string
          id: string
          ordered_qty: number
          po_item_id: string | null
          product_id: string | null
          product_name: string
          received_qty: number
          tenant_id: string
          total_cost: number
          unit_cost: number
          vat_rate: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          damaged_qty?: number
          expiry_date?: string | null
          grn_id: string
          id?: string
          ordered_qty?: number
          po_item_id?: string | null
          product_id?: string | null
          product_name: string
          received_qty?: number
          tenant_id: string
          total_cost?: number
          unit_cost?: number
          vat_rate?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          damaged_qty?: number
          expiry_date?: string | null
          grn_id?: string
          id?: string
          ordered_qty?: number
          po_item_id?: string | null
          product_id?: string | null
          product_name?: string
          received_qty?: number
          tenant_id?: string
          total_cost?: number
          unit_cost?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      held_sales: {
        Row: {
          branch_id: string | null
          cart_data: Json
          cashier_id: string | null
          created_at: string | null
          id: string
          name: string | null
          tenant_id: string | null
        }
        Insert: {
          branch_id?: string | null
          cart_data: Json
          cashier_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Update: {
          branch_id?: string | null
          cart_data?: Json
          cashier_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "held_sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "held_sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "held_sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          branch_id: string
          id: string
          last_updated: string | null
          product_id: string
          quantity: number | null
          reserved_quantity: number | null
          tenant_id: string | null
        }
        Insert: {
          branch_id: string
          id?: string
          last_updated?: string | null
          product_id: string
          quantity?: number | null
          reserved_quantity?: number | null
          tenant_id?: string | null
        }
        Update: {
          branch_id?: string
          id?: string
          last_updated?: string | null
          product_id?: string
          quantity?: number | null
          reserved_quantity?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          performed_by: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          stock_after: number
          stock_before: number
          tenant_id: string
          unit_cost: number | null
          unit_price: number | null
        }
        Insert: {
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          tenant_id: string
          unit_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          batch_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number
          stock_before?: number
          tenant_id?: string
          unit_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_reason: string | null
          created_at: string
          currency: string | null
          id: string
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          stripe_invoice_id: string | null
          subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_transactions: {
        Row: {
          amount: number
          checkout_request_id: string
          created_at: string | null
          id: string
          merchant_request_id: string
          mpesa_receipt: string | null
          phone_number: string
          result_code: string | null
          result_desc: string | null
          sale_id: string | null
          status: string | null
          tenant_id: string | null
          transaction_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          checkout_request_id: string
          created_at?: string | null
          id?: string
          merchant_request_id: string
          mpesa_receipt?: string | null
          phone_number: string
          result_code?: string | null
          result_desc?: string | null
          sale_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          checkout_request_id?: string
          created_at?: string | null
          id?: string
          merchant_request_id?: string
          mpesa_receipt?: string | null
          phone_number?: string
          result_code?: string | null
          result_desc?: string | null
          sale_id?: string | null
          status?: string | null
          tenant_id?: string | null
          transaction_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          mpesa_transaction_id: string | null
          reference: string | null
          sale_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          mpesa_transaction_id?: string | null
          reference?: string | null
          sale_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          mpesa_transaction_id?: string | null
          reference?: string | null
          sale_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_mpesa"
            columns: ["mpesa_transaction_id"]
            isOneToOne: false
            referencedRelation: "mpesa_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_branches: number
          max_products: number
          max_users: number
          name: string
          price_monthly: number
          price_semiannual: number
          price_yearly: number
          slug: string
          stripe_monthly_price_id: string | null
          stripe_semiannual_price_id: string | null
          stripe_yearly_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number
          max_products?: number
          max_users?: number
          name: string
          price_monthly?: number
          price_semiannual?: number
          price_yearly?: number
          slug: string
          stripe_monthly_price_id?: string | null
          stripe_semiannual_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_branches?: number
          max_products?: number
          max_users?: number
          name?: string
          price_monthly?: number
          price_semiannual?: number
          price_yearly?: number
          slug?: string
          stripe_monthly_price_id?: string | null
          stripe_semiannual_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          batch_number: string
          branch_id: string | null
          cost_price: number
          created_at: string
          expiry_date: string | null
          id: string
          initial_quantity: number
          notes: string | null
          product_id: string
          received_at: string
          remaining_qty: number
          selling_price: number | null
          supplier_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          batch_number: string
          branch_id?: string | null
          cost_price?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          notes?: string | null
          product_id: string
          received_at?: string
          remaining_qty?: number
          selling_price?: number | null
          supplier_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          batch_number?: string
          branch_id?: string | null
          cost_price?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          notes?: string | null
          product_id?: string
          received_at?: string
          remaining_qty?: number
          selling_price?: number | null
          supplier_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          branch_id: string | null
          category_id: string | null
          cost_price: number
          created_at: string | null
          description: string | null
          etims_item_cls_cd: string | null
          etims_tax_type_cd: string
          first_sale_at: string | null
          has_serial: boolean | null
          has_warranty: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_sale_at: string | null
          low_stock_threshold: number | null
          max_stock_level: number | null
          name: string
          quantity: number | null
          reorder_level: number | null
          reorder_quantity: number
          selling_price: number
          sku: string
          stock_classification: string
          stocked_at: string | null
          supplier_id: string | null
          tenant_id: string | null
          total_sold: number
          track_inventory: boolean | null
          unit: string
          updated_at: string | null
          vat_rate: number | null
          warranty_months: number | null
        }
        Insert: {
          barcode?: string | null
          branch_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          etims_item_cls_cd?: string | null
          etims_tax_type_cd?: string
          first_sale_at?: string | null
          has_serial?: boolean | null
          has_warranty?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_sale_at?: string | null
          low_stock_threshold?: number | null
          max_stock_level?: number | null
          name: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number
          selling_price?: number
          sku: string
          stock_classification?: string
          stocked_at?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          total_sold?: number
          track_inventory?: boolean | null
          unit?: string
          updated_at?: string | null
          vat_rate?: number | null
          warranty_months?: number | null
        }
        Update: {
          barcode?: string | null
          branch_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string | null
          description?: string | null
          etims_item_cls_cd?: string | null
          etims_tax_type_cd?: string
          first_sale_at?: string | null
          has_serial?: boolean | null
          has_warranty?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_sale_at?: string | null
          low_stock_threshold?: number | null
          max_stock_level?: number | null
          name?: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number
          selling_price?: number
          sku?: string
          stock_classification?: string
          stocked_at?: string | null
          supplier_id?: string | null
          tenant_id?: string | null
          total_sold?: number
          track_inventory?: boolean | null
          unit?: string
          updated_at?: string | null
          vat_rate?: number | null
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          subdomain: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          subdomain?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          subdomain?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          id: string
          notes: string | null
          ordered_qty: number
          po_id: string
          product_id: string
          product_name: string | null
          product_sku: string | null
          purchase_order_id: string | null
          quantity: number
          received_qty: number | null
          received_quantity: number
          tenant_id: string | null
          total: number
          total_price: number
          unit: string
          unit_price: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          ordered_qty: number
          po_id: string
          product_id: string
          product_name?: string | null
          product_sku?: string | null
          purchase_order_id?: string | null
          quantity?: number
          received_qty?: number | null
          received_quantity?: number
          tenant_id?: string | null
          total?: number
          total_price: number
          unit?: string
          unit_price: number
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          ordered_qty?: number
          po_id?: string
          product_id?: string
          product_name?: string | null
          product_sku?: string | null
          purchase_order_id?: string | null
          quantity?: number
          received_qty?: number | null
          received_quantity?: number
          tenant_id?: string | null
          total?: number
          total_price?: number
          unit?: string
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "supplier_catalogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number
          email_sent_at: string | null
          expected_date: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          paid_amount: number | null
          po_number: string
          po_type: string
          received_date: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number
          email_sent_at?: string | null
          expected_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          po_number: string
          po_type?: string
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number
          email_sent_at?: string | null
          expected_date?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          po_number?: string
          po_type?: string
          received_date?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          discount_amount: number | null
          id: string
          product_id: string
          quantity: number
          quotation_id: string
          tax_amount: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          discount_amount?: number | null
          id?: string
          product_id: string
          quantity: number
          quotation_id: string
          tax_amount?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          discount_amount?: number | null
          id?: string
          product_id?: string
          quantity?: number
          quotation_id?: string
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          branch_id: string
          converted_sale_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          quote_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          branch_id: string
          converted_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          branch_id?: string
          converted_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_converted_sale_id_fkey"
            columns: ["converted_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          discount_amount: number | null
          id: string
          product_id: string
          quantity: number
          sale_id: string
          serial_number: string | null
          tax_amount: number | null
          total_price: number
          unit_price: number
          warranty_expires: string | null
        }
        Insert: {
          discount_amount?: number | null
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          serial_number?: string | null
          tax_amount?: number | null
          total_price: number
          unit_price: number
          warranty_expires?: string | null
        }
        Update: {
          discount_amount?: number | null
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          serial_number?: string | null
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
          warranty_expires?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          branch_id: string
          cashier_id: string | null
          change_amount: number | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          mpesa_phone: string | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          payment_status: string | null
          receipt_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          mpesa_phone?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_number: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          cashier_id?: string | null
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          mpesa_phone?: string | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          notification_email: string | null
          product_id: string | null
          tenant_id: string
          threshold_days: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_email?: string | null
          product_id?: string | null
          tenant_id: string
          threshold_days?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_email?: string | null
          product_id?: string | null
          tenant_id?: string
          threshold_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          branch_id: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_catalogs: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          moq: number
          notes: string | null
          product_id: string | null
          product_name: string
          supplier_id: string
          supplier_sku: string | null
          tenant_id: string
          unit: string
          unit_price: number
          updated_at: string
          vat_applicable: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          moq?: number
          notes?: string | null
          product_id?: string | null
          product_name: string
          supplier_id: string
          supplier_sku?: string | null
          tenant_id: string
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_applicable?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          moq?: number
          notes?: string | null
          product_id?: string | null
          product_name?: string
          supplier_id?: string
          supplier_sku?: string | null
          tenant_id?: string
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_applicable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_catalogs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          balance: number | null
          city: string | null
          contact_name: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean
          lead_time_days: number
          name: string
          notes: string | null
          outstanding_balance: number | null
          payment_terms: string | null
          phone: string | null
          product_categories: string[]
          rating: number | null
          tax_pin: string | null
          tenant_id: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean
          lead_time_days?: number
          name: string
          notes?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[]
          rating?: number | null
          tax_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean
          lead_time_days?: number
          name?: string
          notes?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[]
          rating?: number | null
          tax_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_mpesa_settings: {
        Row: {
          consumer_key: string
          consumer_secret: string
          created_at: string
          environment: string
          id: string
          initiator_name: string | null
          is_active: boolean
          passkey: string
          security_credential: string | null
          shortcode: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string
          security_credential?: string | null
          shortcode?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string
          environment?: string
          id?: string
          initiator_name?: string | null
          is_active?: boolean
          passkey?: string
          security_credential?: string | null
          shortcode?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_mpesa_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          country: string
          created_at: string
          currency: string
          custom_domain: string | null
          grace_period_ends_at: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          owner_email: string
          owner_name: string
          payment_failure_count: number
          phone: string | null
          plan_id: string | null
          primary_color: string
          receipt_footer: string | null
          receipt_header: string | null
          receipt_prefix: string
          status: string
          stripe_customer_id: string | null
          subdomain: string
          tax_enabled: boolean
          tax_name: string | null
          tax_rate: number | null
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          currency?: string
          custom_domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          owner_email?: string
          owner_name?: string
          payment_failure_count?: number
          phone?: string | null
          plan_id?: string | null
          primary_color?: string
          receipt_footer?: string | null
          receipt_header?: string | null
          receipt_prefix?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain: string
          tax_enabled?: boolean
          tax_name?: string | null
          tax_rate?: number | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          custom_domain?: string | null
          grace_period_ends_at?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          owner_email?: string
          owner_name?: string
          payment_failure_count?: number
          phone?: string | null
          plan_id?: string | null
          primary_color?: string
          receipt_footer?: string | null
          receipt_header?: string | null
          receipt_prefix?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string
          tax_enabled?: boolean
          tax_name?: string | null
          tax_rate?: number | null
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants_etims_settings: {
        Row: {
          branch_id: string
          created_at: string
          device_serial: string
          environment: string
          id: string
          init_response: Json | null
          initialized_at: string | null
          is_enabled: boolean
          kra_pin: string | null
          next_invoice_no: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          branch_id?: string
          created_at?: string
          device_serial?: string
          environment?: string
          id?: string
          init_response?: Json | null
          initialized_at?: string | null
          is_enabled?: boolean
          kra_pin?: string | null
          next_invoice_no?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          device_serial?: string
          environment?: string
          id?: string
          init_response?: Json | null
          initialized_at?: string | null
          is_enabled?: boolean
          kra_pin?: string | null
          next_invoice_no?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_etims_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vat_configurations: {
        Row: {
          apply_vat_to_services: boolean
          created_at: string
          default_vat_rate: number
          id: string
          invoice_footer_note: string | null
          is_vat_registered: boolean
          tenant_id: string
          updated_at: string
          vat_inclusive: boolean
          vat_registration_number: string | null
          zero_rate_exports: boolean
        }
        Insert: {
          apply_vat_to_services?: boolean
          created_at?: string
          default_vat_rate?: number
          id?: string
          invoice_footer_note?: string | null
          is_vat_registered?: boolean
          tenant_id: string
          updated_at?: string
          vat_inclusive?: boolean
          vat_registration_number?: string | null
          zero_rate_exports?: boolean
        }
        Update: {
          apply_vat_to_services?: boolean
          created_at?: string
          default_vat_rate?: number
          id?: string
          invoice_footer_note?: string | null
          is_vat_registered?: boolean
          tenant_id?: string
          updated_at?: string
          vat_inclusive?: boolean
          vat_registration_number?: string | null
          zero_rate_exports?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vat_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_records: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          notes: string | null
          product_id: string
          sale_id: string
          serial_number: string | null
          warranty_end: string
          warranty_start: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          product_id: string
          sale_id: string
          serial_number?: string | null
          warranty_end: string
          warranty_start: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          sale_id?: string
          serial_number?: string | null
          warranty_end?: string
          warranty_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_aging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranty_records_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_sales_summary: {
        Row: {
          branch_id: string | null
          card_revenue: number | null
          cash_revenue: number | null
          credit_revenue: number | null
          mpesa_revenue: number | null
          sale_date: string | null
          total_discounts: number | null
          total_revenue: number | null
          total_tax: number | null
          total_transactions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_aging: {
        Row: {
          age_bucket: string | null
          branch_id: string | null
          category_id: string | null
          category_name: string | null
          computed_classification: string | null
          cost_price: number | null
          days_in_inventory: number | null
          days_since_last_sale: number | null
          first_sale_at: string | null
          id: string | null
          last_sale_at: string | null
          low_stock_threshold: number | null
          name: string | null
          quantity: number | null
          reorder_quantity: number | null
          selling_price: number | null
          sku: string | null
          stock_classification: string | null
          stock_value: number | null
          stocked_at: string | null
          supplier_id: string | null
          supplier_name: string | null
          tenant_id: string | null
          total_sold: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      low_stock_alerts: {
        Row: {
          category_name: string | null
          current_stock: number | null
          id: string | null
          name: string | null
          reorder_level: number | null
          sku: string | null
          supplier_name: string | null
          supplier_phone: string | null
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          available_quantity: number | null
          barcode: string | null
          buying_price: number | null
          category_id: string | null
          category_name: string | null
          has_serial: boolean | null
          has_warranty: boolean | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_low_stock: boolean | null
          is_out_of_stock: boolean | null
          name: string | null
          reorder_level: number | null
          reserved_quantity: number | null
          selling_price: number | null
          sku: string | null
          stock_quantity: number | null
          tenant_id: string | null
          unit: string | null
          vat_rate: number | null
          warranty_months: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_etims_invoice_no: { Args: { p_tenant_id: string }; Returns: number }
      confirm_grn: { Args: { p_grn_id: string }; Returns: undefined }
      current_tenant_id: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      decrement_stock: {
        Args: { p_branch_id: string; p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      generate_grn_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_po_number: { Args: { p_tenant_id: string }; Returns: string }
      generate_receipt_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_sales_summary: {
        Args: { p_branch_id?: string; p_end_date: string; p_start_date: string }
        Returns: {
          card_revenue: number
          cash_revenue: number
          credit_revenue: number
          mpesa_revenue: number
          sale_date: string
          total_discounts: number
          total_revenue: number
          total_tax: number
          total_txns: number
        }[]
      }
      is_super_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
