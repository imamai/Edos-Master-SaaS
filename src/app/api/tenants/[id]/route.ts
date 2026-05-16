import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { status, plan_id } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (plan_id) updates.plan_id = plan_id

  if (status === 'grace_period') {
    const graceEnd = new Date()
    graceEnd.setDate(graceEnd.getDate() + 7)
    updates.grace_period_ends_at = graceEnd.toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ message: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('tenants').delete().eq('id', id)
  if (error) return NextResponse.json({ message: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
