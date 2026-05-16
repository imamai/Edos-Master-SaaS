import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: MpesaCallback = await req.json()
    const { stkCallback } = body.Body

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    // Extract M-Pesa receipt number and transaction details
    let mpesaReceiptNumber: string | null = null
    let amount: number | null = null
    let phone: string | null = null

    if (ResultCode === 0 && CallbackMetadata) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value || '')
        if (item.Name === 'Amount') amount = Number(item.Value || 0)
        if (item.Name === 'PhoneNumber') phone = String(item.Value || '')
      }
    }

    const isSuccess = ResultCode === 0

    // Update mpesa_transactions
    const { data: txn } = await supabaseAdmin
      .from('mpesa_transactions')
      .update({
        status: isSuccess ? 'completed' : 'failed',
        mpesa_receipt: mpesaReceiptNumber,
        result_code: ResultCode,
        result_desc: ResultDesc,
      })
      .eq('checkout_request_id', CheckoutRequestID)
      .select()
      .single()

    if (isSuccess && txn?.reference_id && txn.type === 'sale') {
      // Update the sale with M-Pesa receipt
      await supabaseAdmin
        .from('sales')
        .update({
          payment_status: 'paid',
          mpesa_receipt: mpesaReceiptNumber,
          mpesa_phone: phone || txn.phone,
        })
        .eq('id', txn.reference_id)
    }

    if (isSuccess && txn?.type === 'subscription' && txn.reference_id) {
      // Update subscription payment status
      await supabaseAdmin
        .from('subscriptions')
        .update({
          last_payment_at: new Date().toISOString(),
          last_payment_amount: amount,
          failed_payment_count: 0,
          status: 'active',
        })
        .eq('id', txn.reference_id)

      // Update tenant status to active
      if (txn.tenant_id) {
        await supabaseAdmin
          .from('tenants')
          .update({ status: 'active' })
          .eq('id', txn.tenant_id)
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('M-Pesa callback error:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
  }
}
