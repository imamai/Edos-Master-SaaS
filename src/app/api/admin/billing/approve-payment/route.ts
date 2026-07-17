// Super admin approves a pending bank_transfer subscription_payments row —
// the actual renewal side-effects (extend period, reactivate tenant,
// invoice, audit log, receipt email) all go through the same shared
// applySubscriptionPayment() every other rail uses.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { applySubscriptionPayment } from '@/lib/billing/applyPayment'
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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { paymentId } = await req.json() as { paymentId?: string }
  if (!paymentId) return NextResponse.json({ message: 'paymentId is required' }, { status: 400 })

  const { data: payment } = await supabaseAdmin
    .from('subscription_payments')
    .select('id, tenant_id, subscription_id, amount, method, provider_reference, status')
    .eq('id', paymentId)
    .single()

  if (!payment) return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
  if (payment.status === 'completed') return NextResponse.json({ message: 'Already approved' }, { status: 409 })

  try {
    await applySubscriptionPayment({
      tenantId: payment.tenant_id,
      subscriptionId: payment.subscription_id!,
      amount: payment.amount,
      method: payment.method as 'bank_transfer' | 'manual',
      providerReference: payment.provider_reference!,
      approvedBy: user.id,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/billing/approve-payment]', err)
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Failed to approve' }, { status: 500 })
  }
}
