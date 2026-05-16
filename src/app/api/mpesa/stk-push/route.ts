import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateSTKPush } from '@/lib/mpesa'
import { createClient as adminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { phone, amount, saleId, tenantId } = await req.json()

    if (!phone || !amount || !tenantId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const result = await initiateSTKPush({
      phone,
      amount,
      accountReference: saleId || tenantId.substring(0, 12),
      transactionDesc: 'EdosPoa Sale',
    })

    if (result.ResponseCode !== '0') {
      return NextResponse.json(
        { message: result.ResponseDescription || 'STK Push failed' },
        { status: 400 }
      )
    }

    // Record pending transaction
    await supabaseAdmin.from('mpesa_transactions').insert({
      tenant_id: tenantId,
      checkout_request_id: result.CheckoutRequestID,
      merchant_request_id: result.MerchantRequestID,
      phone: phone.replace(/^0/, '254'),
      amount,
      type: 'sale',
      reference_id: saleId,
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      message: 'STK Push sent to ' + phone,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to initiate M-Pesa payment'
    console.error('STK Push error:', err)
    return NextResponse.json({ message }, { status: 500 })
  }
}
