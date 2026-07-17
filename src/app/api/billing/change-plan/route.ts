// Plan upgrade/downgrade, implementing the agreed proration policy:
// upgrades take effect immediately with a prorated invoice for the
// remaining days in the current period; downgrades are deferred to the
// next renewal (no refund of already-collected prepaid time) — recorded
// as pending_plan_id/pending_billing_cycle and applied automatically by
// applySubscriptionPayment() when the next renewal payment lands.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getPlanPrice } from '@/lib/utils'
import { sendBillingEmail } from '@/lib/email/send'
import { invoiceCreatedEmail } from '@/lib/email/templates/billing'
import { calculateProration, daysUntil } from '@/lib/billing/pricing'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id || profile.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { planId, billingCycle } = await req.json() as { planId?: string; billingCycle?: 'monthly' | 'semiannual' | 'yearly' }
  if (!planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

  const [{ data: tenant }, { data: subscription }, { data: newPlan }] = await Promise.all([
    supabaseAdmin.from('tenants').select('id, name, owner_name, owner_email, subdomain, plan_id').eq('id', profile.tenant_id).single(),
    supabaseAdmin.from('subscriptions').select('*').eq('tenant_id', profile.tenant_id).single(),
    supabaseAdmin.from('plans').select('*').eq('id', planId).single(),
  ])

  if (!tenant || !subscription || !newPlan) {
    return NextResponse.json({ error: 'Tenant, subscription, or plan not found' }, { status: 404 })
  }

  const { data: oldPlan } = subscription.plan_id
    ? await supabaseAdmin.from('plans').select('*').eq('id', subscription.plan_id).single()
    : { data: null }

  const cycle = billingCycle ?? (subscription.billing_cycle as 'monthly' | 'semiannual' | 'yearly' | null) ?? 'monthly'
  const newPrice = getPlanPrice(newPlan, cycle)
  const oldPrice = oldPlan ? getPlanPrice(oldPlan, cycle) : 0

  const now = new Date()
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : now
  const remainingDays = Math.max(0, daysUntil(periodEnd, now))

  if (newPrice <= oldPrice) {
    // Downgrade (or lateral/no-op) — deferred to the next renewal.
    await supabaseAdmin
      .from('subscriptions')
      .update({ pending_plan_id: newPlan.id, pending_billing_cycle: cycle })
      .eq('id', subscription.id)

    await supabaseAdmin.from('subscription_audit_logs').insert({
      tenant_id: tenant.id,
      subscription_id: subscription.id,
      actor_type: 'user',
      actor_id: user.id,
      action: 'downgrade_scheduled',
      old_value: { plan_id: subscription.plan_id, billing_cycle: subscription.billing_cycle },
      new_value: { pending_plan_id: newPlan.id, pending_billing_cycle: cycle, effective_at: subscription.current_period_end },
    })

    return NextResponse.json({ ok: true, immediate: false, effectiveAt: subscription.current_period_end })
  }

  // Upgrade — takes effect now.
  const proratedAmount = calculateProration(oldPrice, newPrice, remainingDays, cycle)

  await supabaseAdmin
    .from('subscriptions')
    .update({ plan_id: newPlan.id, billing_cycle: cycle, amount: newPrice, pending_plan_id: null, pending_billing_cycle: null })
    .eq('id', subscription.id)
  await supabaseAdmin.from('tenants').update({ plan_id: newPlan.id }).eq('id', tenant.id)

  await supabaseAdmin.from('subscription_audit_logs').insert({
    tenant_id: tenant.id,
    subscription_id: subscription.id,
    actor_type: 'user',
    actor_id: user.id,
    action: 'upgraded',
    old_value: { plan_id: subscription.plan_id, billing_cycle: subscription.billing_cycle, amount: subscription.amount },
    new_value: { plan_id: newPlan.id, billing_cycle: cycle, amount: newPrice, prorated_amount: proratedAmount },
  })

  let invoiceId: string | null = null
  if (proratedAmount > 0) {
    const { data: inv } = await supabaseAdmin
      .from('invoices')
      .insert({
        tenant_id: tenant.id,
        subscription_id: subscription.id,
        amount: proratedAmount,
        currency: 'KES',
        status: 'pending',
        invoice_number: `INV-${Date.now()}`,
        due_date: now.toISOString(),
        period_start: now.toISOString(),
        period_end: subscription.current_period_end,
        billing_reason: 'proration',
      })
      .select('id')
      .single()
    invoiceId = inv?.id ?? null

    const billingUrl = `https://${tenant.subdomain}.${ROOT_DOMAIN}/settings?tab=Billing`
    const email = invoiceCreatedEmail({
      tenantName: tenant.name,
      ownerName: tenant.owner_name,
      billingUrl,
      planName: newPlan.name,
      periodEndLabel: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-KE', { dateStyle: 'long' }) : '',
      invoiceNumber: `INV-${Date.now()}`,
      amountLabel: `KES ${proratedAmount.toFixed(2)}`,
      dueDateLabel: 'now',
      reason: 'proration',
    })
    await sendBillingEmail({ tenantId: tenant.id, to: tenant.owner_email, template: 'invoice_created', subject: email.subject, html: email.html })
  }

  return NextResponse.json({ ok: true, immediate: true, proratedAmount, invoiceId })
}
