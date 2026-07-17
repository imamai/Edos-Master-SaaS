// Callback for the platform M-Pesa subscription-billing STK push (see
// src/app/api/billing/mpesa/initiate/route.ts). Deliberately a separate
// route from src/app/api/webhooks/mpesa/route.ts (POS sales) — that one
// updates the sale-scoped `payments`/`mpesa_transactions` tables, this one
// updates `subscription_payments` and, on success, extends the tenant's
// subscription via the shared applySubscriptionPayment() function.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
import { applySubscriptionPayment } from '@/lib/billing/applyPayment'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: { Item: Array<{ Name: string; Value?: string | number }> }
    }
  }
}

function isAuthenticCallback(req: NextRequest): boolean {
  const expected = process.env.MPESA_WEBHOOK_SECRET
  if (!expected) {
    console.error('M-Pesa subscription callback rejected: MPESA_WEBHOOK_SECRET is not configured')
    return false
  }
  const provided = req.nextUrl.searchParams.get('token') ?? ''
  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(expected)
  if (providedBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(providedBuf, expectedBuf)
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticCallback(req)) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Unauthorized' }, { status: 401 })
    }

    const body: MpesaCallback = await req.json()
    const { stkCallback } = body.Body
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    let mpesaReceiptNumber: string | null = null
    let callbackAmount: number | null = null
    if (ResultCode === 0 && CallbackMetadata) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value || '')
        if (item.Name === 'Amount') callbackAmount = Number(item.Value)
      }
    }

    const { data: payment } = await supabaseAdmin
      .from('subscription_payments')
      .select('id, tenant_id, subscription_id, amount, status')
      .eq('method', 'mpesa')
      .eq('provider_reference', CheckoutRequestID)
      .single()

    if (!payment) {
      console.error('M-Pesa subscription callback: no matching pending payment', CheckoutRequestID)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
    }

    if (payment.status === 'completed') {
      // Already applied (retry) — idempotent no-op.
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Already processed' })
    }

    let isSuccess = ResultCode === 0
    if (isSuccess && callbackAmount !== null && callbackAmount !== Math.ceil(payment.amount)) {
      isSuccess = false
      console.error('M-Pesa subscription callback amount mismatch', {
        CheckoutRequestID,
        expected: payment.amount,
        received: callbackAmount,
      })
    }

    if (!isSuccess) {
      await supabaseAdmin.from('subscription_payments').update({ status: 'failed', notes: ResultDesc }).eq('id', payment.id)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
    }

    if (mpesaReceiptNumber) {
      await supabaseAdmin.from('subscription_payments').update({ notes: `M-Pesa receipt: ${mpesaReceiptNumber}` }).eq('id', payment.id)
    }

    // provider_reference must stay CheckoutRequestID — that's the key the
    // pending row was created with (see billing/mpesa/initiate), so
    // applySubscriptionPayment finds and updates the SAME row rather than
    // inserting a duplicate. It's still idempotent against redelivery.
    await applySubscriptionPayment({
      tenantId: payment.tenant_id,
      subscriptionId: payment.subscription_id!,
      amount: payment.amount,
      method: 'mpesa',
      providerReference: CheckoutRequestID,
    })

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('M-Pesa subscription callback error:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
  }
}
