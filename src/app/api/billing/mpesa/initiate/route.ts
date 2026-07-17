// Subscription billing STK push — uses EdosPoa's OWN platform Paybill/Till
// (PLATFORM_MPESA_* env vars), never a tenant's own tenant_mpesa_settings
// (that's for collecting money from the tenant's own customers at the POS).
import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { initiateSTKPush } from '@/lib/mpesa'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function platformMpesaCredentials() {
  const consumerKey = process.env.PLATFORM_MPESA_CONSUMER_KEY
  const consumerSecret = process.env.PLATFORM_MPESA_CONSUMER_SECRET
  const shortcode = process.env.PLATFORM_MPESA_SHORTCODE
  const passkey = process.env.PLATFORM_MPESA_PASSKEY
  if (!consumerKey || !consumerSecret || !shortcode || !passkey) return null

  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    environment: (process.env.PLATFORM_MPESA_ENVIRONMENT === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  }
}

export async function POST(req: NextRequest) {
  const credentials = platformMpesaCredentials()
  if (!credentials) {
    return NextResponse.json({ error: 'M-Pesa billing is not configured yet. Try another payment method.' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id || !['owner', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { phone } = await req.json() as { phone?: string }
  if (!phone || phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'Enter a valid M-Pesa phone number' }, { status: 400 })
  }

  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('id, name, subdomain')
    .eq('id', profile.tenant_id)
    .single()
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, amount, pending_plan_id, pending_billing_cycle, billing_cycle, plan_id')
    .eq('tenant_id', tenant.id)
    .single()
  if (!subscription) return NextResponse.json({ error: 'No subscription found for this account' }, { status: 404 })

  const planId = subscription.pending_plan_id ?? subscription.plan_id
  const cycle = subscription.pending_billing_cycle ?? subscription.billing_cycle ?? 'monthly'
  const { data: plan } = planId ? await supabaseAdmin.from('plans').select('*').eq('id', planId).single() : { data: null }
  const amount = plan
    ? (cycle === 'yearly' ? plan.price_yearly : cycle === 'semiannual' ? plan.price_semiannual : plan.price_monthly)
    : subscription.amount

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Could not determine the amount due' }, { status: 400 })
  }

  try {
    const stk = await initiateSTKPush(
      {
        phone,
        amount,
        accountReference: tenant.subdomain.slice(0, 12),
        transactionDesc: 'EdosPoa renewal',
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa-subscription?token=${encodeURIComponent(process.env.MPESA_WEBHOOK_SECRET || '')}`,
      },
      credentials
    )

    if (stk.ResponseCode !== '0') {
      return NextResponse.json({ error: stk.ResponseDescription || 'Could not start the M-Pesa payment' }, { status: 502 })
    }

    // provider_reference = CheckoutRequestID, mirroring how the existing
    // sales mpesa_transactions table keys off the same field — the callback
    // looks the row up by this exact value.
    await supabaseAdmin.from('subscription_payments').insert({
      tenant_id: tenant.id,
      subscription_id: subscription.id,
      method: 'mpesa',
      amount,
      status: 'pending',
      provider_reference: stk.CheckoutRequestID,
      notes: `phone: ${phone}`,
    })

    return NextResponse.json({ checkoutRequestId: stk.CheckoutRequestID, message: stk.CustomerMessage })
  } catch (err) {
    console.error('[billing/mpesa/initiate]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start the M-Pesa payment' }, { status: 502 })
  }
}
