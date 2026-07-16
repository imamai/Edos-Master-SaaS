import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { constructWebhookEvent } from '@/lib/stripe'
import Stripe from 'stripe'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, sig)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Stripe redelivers on timeout/non-2xx — record the event id first so a
  // retry of an already-processed event is a no-op instead of re-running
  // side effects (e.g. inserting a duplicate `invoices` row).
  // stripe_webhook_events isn't in the generated Database type yet (new
  // table, types not regenerated) — cast narrowly for this one call.
  const { error: dedupeError } = await (supabaseAdmin as unknown as { from(table: string): any })
    .from('stripe_webhook_events')
    .insert({ event_id: event.id, event_type: event.type })
  if (dedupeError) {
    // Unique violation on event_id means we've already handled this event.
    if (dedupeError.code === '23505') {
      return NextResponse.json({ received: true, deduped: true })
    }
    console.error('Stripe webhook dedupe-record error:', dedupeError)
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const tenantId = invoice.metadata?.tenant_id || invoice.subscription_details?.metadata?.tenant_id

        if (tenantId) {
          await supabaseAdmin.from('tenants').update({ status: 'active' }).eq('id', tenantId)

          const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
          if (subId) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'active',
                last_payment_at: new Date().toISOString(),
                last_payment_amount: (invoice.amount_paid || 0) / 100,
                failed_payment_count: 0,
              })
              .eq('stripe_subscription_id', subId)
          }

          // Create invoice record
          await supabaseAdmin.from('invoices').insert({
            tenant_id: tenantId,
            invoice_number: invoice.number || `INV-${Date.now()}`,
            amount: (invoice.amount_paid || 0) / 100,
            currency: (invoice.currency || 'kes').toUpperCase(),
            status: 'paid',
            due_date: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now()).toISOString(),
            paid_at: new Date().toISOString(),
            stripe_invoice_id: invoice.id,
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const tenantId = invoice.metadata?.tenant_id

        if (tenantId) {
          const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

          // Increment failed count
          if (subId) {
            const { data: sub } = await supabaseAdmin
              .from('subscriptions')
              .select('failed_payment_count')
              .eq('stripe_subscription_id', subId)
              .single()

            const failedCount = (sub?.failed_payment_count || 0) + 1

            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'past_due',
                failed_payment_count: failedCount,
              })
              .eq('stripe_subscription_id', subId)

            // Move to grace period after first failure, suspend after 3
            if (failedCount === 1) {
              await supabaseAdmin.from('tenants').update({ status: 'grace_period' }).eq('id', tenantId)
            } else if (failedCount >= 3) {
              await supabaseAdmin.from('tenants').update({ status: 'suspended' }).eq('id', tenantId)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenant_id

        if (tenantId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id)

          await supabaseAdmin.from('tenants').update({ status: 'suspended' }).eq('id', tenantId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenant_id

        if (tenantId && subscription.status === 'active') {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
