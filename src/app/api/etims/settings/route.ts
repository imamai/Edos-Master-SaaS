import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function serviceClient() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET – fetch eTIMS settings for the authenticated tenant
export async function GET(_req: NextRequest) {
  const user = await createClient()
  const { data: { user: authUser } } = await user.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', authUser.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ error: 'No tenant' }, { status: 403 })

  const { data, error } = await supabase
    .from('tenants_etims_settings')
    .select('id, is_enabled, environment, kra_pin, branch_id, device_serial, next_invoice_no, initialized_at')
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data || null })
}

// POST – create or update eTIMS settings
export async function POST(req: NextRequest) {
  const user = await createClient()
  const { data: { user: authUser } } = await user.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = serviceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', authUser.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ error: 'No tenant' }, { status: 403 })
  if (!['owner', 'manager', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as {
    is_enabled:    boolean
    environment:   'sandbox' | 'production'
    kra_pin:       string
    branch_id?:    string
    device_serial?: string
  }

  const { error } = await supabase
    .from('tenants_etims_settings')
    .upsert({
      tenant_id:     profile.tenant_id,
      is_enabled:    body.is_enabled,
      environment:   body.environment,
      kra_pin:       body.kra_pin?.trim().toUpperCase(),
      branch_id:     body.branch_id?.trim() || '000',
      device_serial: body.device_serial?.trim() || 'VSCU001',
    }, { onConflict: 'tenant_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
