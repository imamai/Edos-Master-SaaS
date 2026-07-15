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
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback

    let mpesaReceiptNumber: string | null = null

    if (ResultCode === 0 && CallbackMetadata) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value || '')
      }
    }

    const isSuccess = ResultCode === 0

    // Update mpesa_transactions record
    const { data: txn } = await supabaseAdmin
      .from('mpesa_transactions')
      .update({
        status: isSuccess ? 'completed' : 'failed',
        mpesa_receipt: mpesaReceiptNumber,
        result_code: String(ResultCode),
        result_desc: ResultDesc,
      })
      .eq('checkout_request_id', CheckoutRequestID)
      .select('id')
      .single()

    // Update the linked payments record if one exists
    if (txn?.id) {
      await supabaseAdmin
        .from('payments')
        .update({
          status: isSuccess ? 'completed' : 'failed',
          reference: mpesaReceiptNumber,
        })
        .eq('mpesa_transaction_id', txn.id)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('M-Pesa callback error:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
  }
}
