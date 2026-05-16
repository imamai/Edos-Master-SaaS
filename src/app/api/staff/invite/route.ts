import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email, role, tenantId } = await req.json()

  if (!email || !role || !tenantId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  // Verify the requesting user is owner/manager of this tenant
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.tenant_id !== tenantId || !['owner', 'manager', 'super_admin'].includes(profile?.role ?? '')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  // Use service role client for admin operations
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const redirectTo = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/tenant/dashboard'
      : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'}/tenant/dashboard`

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { tenant_id: tenantId, role },
      redirectTo,
    })

    if (inviteError) {
      return NextResponse.json({ message: inviteError.message }, { status: 400 })
    }

    if (invited.user) {
      await admin.from('profiles').upsert({
        id: invited.user.id,
        email,
        tenant_id: tenantId,
        role,
        full_name: '',
        is_active: true,
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ message: 'Invitation sent' })
  } catch (err) {
    console.error('Staff invite error:', err)
    return NextResponse.json({ message: 'Failed to send invitation' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const { profileId, role, is_active, tenantId } = await req.json()

  if (!profileId || !tenantId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.tenant_id !== tenantId || !['owner', 'manager', 'super_admin'].includes(profile?.role ?? '')) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}
  if (role !== undefined) updates.role = role
  if (is_active !== undefined) updates.is_active = is_active

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .eq('tenant_id', tenantId)

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  return NextResponse.json({ message: 'Updated' })
}
