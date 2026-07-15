import { NextRequest, NextResponse } from 'next/server'
import { querySTKStatus } from '@/lib/mpesa'
import { createClient as adminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { MpesaCredentials } from '@/lib/mpesa'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getTenantCredentials(tenantId: string): Promise<MpesaCredentials> {
  const { data, error } = await supabaseAdmin
    .from('tenant_mpesa_settings')
    .select('consumer_key, consumer_secret, shortcode, passkey, environment')
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) throw new Error('M-Pesa not configured for this tenant')

  return {
    consumerKey: data.consumer_key,
    consumerSecret: data.consumer_secret,
    shortcode: data.shortcode,
    passkey: data.passkey,
    environment: (data.environment as 'sandbox' | 'production') ?? 'sandbox',
  }
}

function parseResultCode(resultCode: string | number | undefined): 'completed' | 'failed' | 'cancelled' | 'pending' {
  if (resultCode === undefined || resultCode === null || resultCode === '') return 'pending'
  const code = Number(resultCode)
  if (code === 0) return 'completed'
  if (code === 1032) return 'cancelled'
  if (code === 1037) return 'failed'
  if (code === 2001) return 'failed'
  if (isNaN(code)) return 'pending'
  return 'failed'
}

export async function POST(req: NextRequest) {
  const { checkoutRequestId, tenantId } = await req.json()

  if (!checkoutRequestId || !tenantId) {
    return NextResponse.json({ message: 'Missing checkoutRequestId or tenantId' }, { status: 400 })
  }

  // 1. Check DB first — webhook may have already resolved it
  try {
    const { data: txn } = await supabaseAdmin
      .from('mpesa_transactions')
      .select('status, result_code, result_desc, mpesa_receipt')
      .eq('checkout_request_id', checkoutRequestId)
      .single()

    if (txn && txn.status !== 'pending') {
      return NextResponse.json({
        status: txn.status,
        mpesaReceipt: txn.mpesa_receipt,
        message: txn.result_desc,
      })
    }
  } catch (err) {
    console.error('DB status check error:', err)
    // non-fatal — fall through to Daraja query
  }

  // 2. Fetch tenant credentials — fail fast if not configured
  let credentials: MpesaCredentials
  try {
    credentials = await getTenantCredentials(tenantId)
  } catch (err) {
    console.error('Credentials fetch error:', err)
    return NextResponse.json({ status: 'failed', message: 'M-Pesa is not configured for this account' })
  }

  // 3. Query Daraja directly (handles sandbox where webhook URL is not public)
  try {
    const daraja = await querySTKStatus(checkoutRequestId, credentials)
    const resultCode = daraja.ResultCode
    const status = parseResultCode(resultCode)

    // Fire-and-forget DB update so it never masks the status we return
    if (status !== 'pending') {
      void supabaseAdmin
        .from('mpesa_transactions')
        .update({
          status,
          result_code: String(resultCode),
          result_desc: daraja.ResultDesc,
        })
        .eq('checkout_request_id', checkoutRequestId)
    }

    return NextResponse.json({ status, message: daraja.ResultDesc })
  } catch (err) {
    // Daraja returned an error or is still processing — keep polling
    console.error('STK Query error (will retry):', err)
    return NextResponse.json({ status: 'pending' })
  }
}
