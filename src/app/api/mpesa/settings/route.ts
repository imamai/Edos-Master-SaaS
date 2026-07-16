import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'

// Untyped admin client — tenant_mpesa_settings not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = adminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any

// GET – fetch the calling tenant's M-Pesa settings (owner/manager only, RLS ensures own row only)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return NextResponse.json({ message: 'No tenant associated with this account' }, { status: 400 })
  }

  if (!['owner', 'manager', 'super_admin'].includes(profile.role as string)) {
    return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 })
  }

  const { data, error } = await db
    .from('tenant_mpesa_settings')
    .select('id, tenant_id, environment, consumer_key, consumer_secret, shortcode, passkey, initiator_name, security_credential, is_active, updated_at')
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data ?? null })
}

// POST – upsert the calling tenant's M-Pesa settings (owner/manager only)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return NextResponse.json({ message: 'No tenant associated with this account' }, { status: 400 })
  }

  if (!['owner', 'manager', 'super_admin'].includes(profile.role as string)) {
    return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await req.json()
  const { environment, consumer_key, consumer_secret, shortcode, passkey, initiator_name, security_credential, is_active } = body

  if (!consumer_key || !consumer_secret || !shortcode || !passkey) {
    return NextResponse.json(
      { message: 'consumer_key, consumer_secret, shortcode and passkey are required' },
      { status: 400 }
    )
  }

  const { data, error } = await db
    .from('tenant_mpesa_settings')
    .upsert(
      {
        tenant_id: profile.tenant_id as string,
        environment: environment ?? 'sandbox',
        consumer_key: (consumer_key as string).trim(),
        consumer_secret: (consumer_secret as string).trim(),
        shortcode: (shortcode as string).trim(),
        passkey: (passkey as string).trim(),
        initiator_name: (initiator_name as string | undefined)?.trim() || null,
        security_credential: (security_credential as string | undefined)?.trim() || null,
        is_active: is_active ?? true,
      },
      { onConflict: 'tenant_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}
