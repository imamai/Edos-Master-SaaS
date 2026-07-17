import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { sendBillingEmail } from '@/lib/email/send'
import { paymentReceivedEmail, subscriptionRenewedEmail } from '@/lib/email/templates/billing'
import { getPlanPrice, formatCurrency } from '@/lib/utils'
import { calculateRenewalPeriod } from './pricing'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

export type PaymentMethod = 'stripe' | 'mpesa' | 'bank_transfer' | 'manual'

interface ApplyPaymentArgs {
  tenantId: string
  subscriptionId: string
  amount: number
  method: PaymentMethod
  /** Idempotency key: Stripe payment intent id, M-Pesa CheckoutRequestID/receipt,
   *  bank reference, or a generated id for manual entries. */
  providerReference: string
  invoiceId?: string | null
  /** Set for bank_transfer/manual approvals — the super_admin profile id. */
  approvedBy?: string | null
  notes?: string | null
}

// The single place every billing rail (Stripe, M-Pesa, bank transfer, manual)
// funds the same prepaid-period state machine: extend the subscription,
// reactivate the tenant, mark the invoice paid, log it, email a receipt.
// Idempotent — guarded by subscription_payments' unique (method,
// provider_reference) index, so a retried webhook/duplicate approval is a
// safe no-op instead of double-extending the period.
export async function applySubscriptionPayment(args: ApplyPaymentArgs): Promise<{ applied: boolean }> {
  const { tenantId, subscriptionId, amount, method, providerReference, invoiceId, approvedBy, notes } = args

  const { data: existingPayment } = await supabaseAdmin
    .from('subscription_payments')
    .select('id, status')
    .eq('method', method)
    .eq('provider_reference', providerReference)
    .maybeSingle()

  if (existingPayment?.status === 'completed') {
    return { applied: false }
  }

  let paymentId = existingPayment?.id ?? null
  if (paymentId) {
    await supabaseAdmin
      .from('subscription_payments')
      .update({ status: 'completed', updated_at: new Date().toISOString(), approved_by: approvedBy ?? null })
      .eq('id', paymentId)
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from('subscription_payments')
      .insert({
        tenant_id: tenantId,
        subscription_id: subscriptionId,
        invoice_id: invoiceId ?? null,
        method,
        amount,
        status: 'completed',
        provider_reference: providerReference,
        approved_by: approvedBy ?? null,
        notes: notes ?? null,
      })
      .select('id')
      .single()
    if (error) throw error
    paymentId = inserted!.id
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*, tenant:tenants(*)')
    .eq('id', subscriptionId)
    .single()
  if (!subscription) throw new Error('Subscription not found')

  const now = new Date()
  const cycle = subscription.pending_billing_cycle ?? subscription.billing_cycle ?? 'monthly'
  const { renewFrom, periodEnd: newPeriodEnd } = calculateRenewalPeriod(
    subscription.current_period_end ? new Date(subscription.current_period_end) : null,
    now,
    cycle
  )

  // Apply any pending downgrade now that a real renewal payment has landed;
  // upgrades already applied plan_id immediately when requested, so this
  // mainly matters for downgrades deferred at request time.
  const planId = subscription.pending_plan_id ?? subscription.plan_id
  const { data: plan } = planId
    ? await supabaseAdmin.from('plans').select('*').eq('id', planId).single()
    : { data: null }

  const subUpdate: Database['public']['Tables']['subscriptions']['Update'] = {
    status: 'active',
    current_period_start: renewFrom.toISOString(),
    current_period_end: newPeriodEnd.toISOString(),
    last_payment_at: now.toISOString(),
    last_payment_amount: amount,
    failed_payment_count: 0,
    cancel_at_period_end: false,
    billing_cycle: cycle,
    pending_plan_id: null,
    pending_billing_cycle: null,
  }
  if (plan) {
    subUpdate.plan_id = plan.id
    subUpdate.amount = getPlanPrice(plan, cycle as 'monthly' | 'semiannual' | 'yearly')
  }

  await supabaseAdmin.from('subscriptions').update(subUpdate).eq('id', subscriptionId)
  await supabaseAdmin
    .from('tenants')
    .update({ status: 'active', grace_period_ends_at: null, ...(plan ? { plan_id: plan.id } : {}) })
    .eq('id', tenantId)

  let finalInvoiceId = invoiceId ?? null
  if (finalInvoiceId) {
    await supabaseAdmin.from('invoices').update({ status: 'paid', paid_at: now.toISOString() }).eq('id', finalInvoiceId)
  } else {
    const { data: inv } = await supabaseAdmin
      .from('invoices')
      .insert({
        tenant_id: tenantId,
        subscription_id: subscriptionId,
        amount,
        currency: 'KES',
        status: 'paid',
        paid_at: now.toISOString(),
        invoice_number: `INV-${Date.now()}`,
        period_start: renewFrom.toISOString(),
        period_end: newPeriodEnd.toISOString(),
        billing_reason: 'renewal',
      })
      .select('id')
      .single()
    finalInvoiceId = inv?.id ?? null
  }
  if (finalInvoiceId && paymentId) {
    await supabaseAdmin.from('subscription_payments').update({ invoice_id: finalInvoiceId }).eq('id', paymentId)
  }

  await supabaseAdmin.from('subscription_audit_logs').insert({
    tenant_id: tenantId,
    subscription_id: subscriptionId,
    actor_type: approvedBy ? 'super_admin' : 'system',
    actor_id: approvedBy ?? null,
    action: 'payment_recorded',
    old_value: { status: subscription.status, current_period_end: subscription.current_period_end },
    new_value: { status: 'active', current_period_end: newPeriodEnd.toISOString(), method, amount },
  })

  const tenant = subscription.tenant as Database['public']['Tables']['tenants']['Row']
  const billingUrl = `https://${tenant.subdomain}.${ROOT_DOMAIN}/settings?tab=Billing`
  const emailCtx = {
    tenantName: tenant.name,
    ownerName: tenant.owner_name,
    billingUrl,
    planName: plan?.name ?? 'your plan',
    periodEndLabel: newPeriodEnd.toLocaleDateString('en-KE', { dateStyle: 'long' }),
  }
  const methodLabel = { stripe: 'card', mpesa: 'M-Pesa', bank_transfer: 'bank transfer', manual: 'manual payment' }[method]

  const receivedEmail = paymentReceivedEmail({ ...emailCtx, amountLabel: formatCurrency(amount), methodLabel, receiptLabel: providerReference })
  await sendBillingEmail({ tenantId, to: tenant.owner_email, template: 'payment_received', subject: receivedEmail.subject, html: receivedEmail.html })

  const renewedEmail = subscriptionRenewedEmail(emailCtx)
  await sendBillingEmail({ tenantId, to: tenant.owner_email, template: 'subscription_renewed', subject: renewedEmail.subject, html: renewedEmail.html })

  return { applied: true }
}
