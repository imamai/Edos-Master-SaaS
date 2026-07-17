// Tenant submits a bank transfer reference (+ optional proof already
// uploaded client-side to the billing-proofs storage bucket). This only
// records a *pending* subscription_payments row — a super_admin must
// approve it in the Billing Portal (Phase 5), which calls
// applySubscriptionPayment() the same way every other rail does.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
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

  const { reference, proofPath } = await req.json() as { reference?: string; proofPath?: string }
  if (!reference || reference.trim().length < 3) {
    return NextResponse.json({ error: 'Enter the bank transaction reference' }, { status: 400 })
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, amount, pending_plan_id, pending_billing_cycle, billing_cycle, plan_id')
    .eq('tenant_id', profile.tenant_id)
    .single()
  if (!subscription) return NextResponse.json({ error: 'No subscription found for this account' }, { status: 404 })

  const planId = subscription.pending_plan_id ?? subscription.plan_id
  const cycle = subscription.pending_billing_cycle ?? subscription.billing_cycle ?? 'monthly'
  const { data: plan } = planId ? await supabaseAdmin.from('plans').select('*').eq('id', planId).single() : { data: null }
  const amount = plan
    ? (cycle === 'yearly' ? plan.price_yearly : cycle === 'semiannual' ? plan.price_semiannual : plan.price_monthly)
    : subscription.amount

  const { error } = await supabaseAdmin.from('subscription_payments').insert({
    tenant_id: profile.tenant_id,
    subscription_id: subscription.id,
    method: 'bank_transfer',
    amount: amount ?? 0,
    status: 'pending',
    provider_reference: reference.trim(),
    proof_url: proofPath ?? null,
  })

  if (error) {
    // Unique (method, provider_reference) violation — same reference submitted twice.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This reference has already been submitted' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Submitted — we will confirm your payment shortly.' })
}
