import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export async function createStripeCustomer(email: string, name: string, tenantId: string) {
  return stripe.customers.create({
    email,
    name,
    metadata: { tenant_id: tenantId },
  })
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  trialDays?: number
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    trial_period_days: trialDays,
  })
}

export async function cancelStripeSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  tenantId: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenant_id: tenantId },
    subscription_data: {
      metadata: { tenant_id: tenantId },
    },
  })
}

export function constructWebhookEvent(payload: string | Buffer, sig: string) {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
