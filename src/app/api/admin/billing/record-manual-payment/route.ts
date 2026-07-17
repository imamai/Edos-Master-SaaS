// Super admin records a manual payment (cash, cheque, etc.) directly — goes
// through the same shared applySubscriptionPayment() as every other rail.
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

  const { tenantId, amount, notes } = await req.json() as { tenantId?: string; amount?: number; notes?: string }
  if (!tenantId || !amount || amount <= 0) {
    return NextResponse.json({ message: 'tenantId and a positive amount are required' }, { status: 400 })
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('tenant_id', tenantId)
    .single()
  if (!subscription) return NextResponse.json({ message: 'No subscription found for this tenant' }, { status: 404 })

  try {
    await applySubscriptionPayment({
      tenantId,
      subscriptionId: subscription.id,
      amount,
      method: 'manual',
      providerReference: `manual-${Date.now()}`,
      approvedBy: user.id,
      notes: notes || null,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/billing/record-manual-payment]', err)
    return NextResponse.json({ message: err instanceof Error ? err.message : 'Failed to record payment' }, { status: 500 })
  }
}
