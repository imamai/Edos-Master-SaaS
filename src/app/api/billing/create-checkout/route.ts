import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe'
import { createClient as adminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id || profile.role !== 'owner') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { priceId, billingCycle } = await req.json()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, owner_email, owner_name, stripe_customer_id')
    .eq('id', profile.tenant_id)
    .single()

  if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 })

  // Get or create Stripe customer — stripe_customer_id lives on tenants,
  // not subscriptions (a tenant may not have a subscriptions row yet)
  let customerId = tenant.stripe_customer_id

  if (!customerId) {
    const customer = await createStripeCustomer(tenant.owner_email, tenant.owner_name, tenant.id)
    customerId = customer.id
    await supabaseAdmin.from('tenants').update({ stripe_customer_id: customerId }).eq('id', tenant.id)
  }

  const origin = req.headers.get('origin') || `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  const session = await createCheckoutSession(
    customerId,
    priceId,
    `${origin}/settings?billing=success`,
    `${origin}/settings?billing=cancelled`,
    tenant.id
  )

  return NextResponse.json({ url: session.url })
}
