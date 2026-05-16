import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { CartItem } from '@/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ message: 'No tenant' }, { status: 403 })

  try {
    const { items, customerId, paymentMethod, amountPaid, discount, taxAmount, subtotal, total, mpesaPhone } = await req.json()

    // Generate receipt number
    const { data: receiptNum } = await supabaseAdmin.rpc('generate_receipt_number', {
      p_tenant_id: profile.tenant_id,
    })

    // Create sale
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert({
        tenant_id: profile.tenant_id,
        branch_id: profile.branch_id,
        customer_id: customerId || null,
        cashier_id: user.id,
        receipt_number: receiptNum || `RCP-${Date.now()}`,
        subtotal,
        discount_amount: discount,
        tax_amount: taxAmount,
        total_amount: total,
        paid_amount: amountPaid,
        change_amount: Math.max(0, amountPaid - total),
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'mpesa' ? 'pending' : 'paid',
        mpesa_phone: mpesaPhone || null,
      })
      .select()
      .single()

    if (saleError || !sale) {
      return NextResponse.json({ message: saleError?.message || 'Failed to create sale' }, { status: 500 })
    }

    // Insert sale items (triggers stock deduction automatically via DB trigger)
    const saleItems = (items as CartItem[]).map((item) => ({
      sale_id: sale.id,
      tenant_id: profile.tenant_id!,
      product_id: item.product.id,
      product_name: item.product.name,
      product_sku: item.product.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      total: item.total,
    }))

    await supabaseAdmin.from('sale_items').insert(saleItems)

    return NextResponse.json({ sale_id: sale.id, receipt_number: sale.receipt_number }, { status: 201 })
  } catch (err) {
    console.error('Sale creation error:', err)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
