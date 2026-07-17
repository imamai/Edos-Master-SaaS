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
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { paymentId, reason } = await req.json() as { paymentId?: string; reason?: string }
  if (!paymentId) return NextResponse.json({ message: 'paymentId is required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('subscription_payments')
    .update({ status: 'failed', notes: reason || 'Rejected by admin', approved_by: user.id })
    .eq('id', paymentId)
    .eq('status', 'pending')

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
