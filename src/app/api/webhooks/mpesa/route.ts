import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
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

// The CallBackURL Safaricom is given (see initiateSTKPush in src/lib/mpesa/index.ts)
// embeds this shared secret as a `token` query param. It never reaches the browser,
// so a request lacking/mismatching it did not originate from our own STK push call.
function isAuthenticCallback(req: NextRequest): boolean {
  const expected = process.env.MPESA_WEBHOOK_SECRET
  if (!expected) {
    console.error('M-Pesa callback rejected: MPESA_WEBHOOK_SECRET is not configured')
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

    // Fetch the pending transaction so a 'success' result can be cross-checked
    // against the amount we actually requested before it's trusted.
    const { data: existing } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('amount')
      .eq('checkout_request_id', CheckoutRequestID)
      .single()

    let isSuccess = ResultCode === 0
    let resultDesc = ResultDesc

    if (isSuccess && existing && callbackAmount !== null && callbackAmount !== Math.ceil(existing.amount)) {
      isSuccess = false
      resultDesc = `Amount mismatch: expected ${Math.ceil(existing.amount)}, received ${callbackAmount}`
      console.error('M-Pesa callback amount mismatch', {
        CheckoutRequestID,
        expected: existing.amount,
        received: callbackAmount,
      })
    }

    // Update mpesa_transactions record
    const { data: txn } = await supabaseAdmin
      .from('mpesa_transactions')
      .update({
        status: isSuccess ? 'completed' : 'failed',
        mpesa_receipt: isSuccess ? mpesaReceiptNumber : null,
        result_code: String(ResultCode),
        result_desc: resultDesc,
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
          reference: isSuccess ? mpesaReceiptNumber : null,
        })
        .eq('mpesa_transaction_id', txn.id)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('M-Pesa callback error:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Received' })
  }
}
