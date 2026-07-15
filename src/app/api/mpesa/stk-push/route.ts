import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initiateSTKPush } from '@/lib/mpesa'
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
    .select('consumer_key, consumer_secret, shortcode, passkey, environment, initiator_name, security_credential, is_active')
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) {
    throw new Error('M-Pesa is not configured for this account. Please set up your M-Pesa credentials in Settings.')
  }
  if (!data.is_active) {
    throw new Error('M-Pesa integration is disabled for this account.')
  }
  if (!data.consumer_key || !data.consumer_secret || !data.shortcode || !data.passkey) {
    throw new Error('M-Pesa credentials are incomplete. Please complete your M-Pesa setup in Settings.')
  }

  return {
    consumerKey: data.consumer_key,
    consumerSecret: data.consumer_secret,
    shortcode: data.shortcode,
    passkey: data.passkey,
    environment: (data.environment as 'sandbox' | 'production') ?? 'sandbox',
    initiatorName: data.initiator_name ?? undefined,
    securityCredential: data.security_credential ?? undefined,
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { phone, amount, saleId, tenantId } = await req.json()

    if (!phone || !amount || !tenantId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const credentials = await getTenantCredentials(tenantId)

    const result = await initiateSTKPush(
      {
        phone,
        amount,
        accountReference: saleId || tenantId.substring(0, 12),
        transactionDesc: 'EdosPoa Sale',
      },
      credentials
    )

    if (result.ResponseCode !== '0') {
      return NextResponse.json(
        { message: result.ResponseDescription || 'STK Push failed' },
        { status: 400 }
      )
    }

    await supabaseAdmin.from('mpesa_transactions').insert({
      tenant_id: tenantId,
      checkout_request_id: result.CheckoutRequestID,
      merchant_request_id: result.MerchantRequestID,
      phone_number: phone.replace(/^0/, '254'),
      amount,
      sale_id: saleId ?? null,
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
