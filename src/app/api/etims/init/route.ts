// Initialise eTIMS device registration with KRA – call once per tenant.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { initDevice, isSuccess } from '@/lib/etims/client'

function serviceClient() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(_req: NextRequest) {
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
  if (!['owner', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden – only owners can initialise eTIMS' }, { status: 403 })
  }

  const { data: etims } = await supabase
    .from('tenants_etims_settings')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .single()

  if (!etims?.kra_pin) {
    return NextResponse.json({ error: 'Configure KRA PIN before initialising' }, { status: 422 })
  }

  const response = await initDevice({
    kra_pin:       etims.kra_pin,
    branch_id:     etims.branch_id,
    device_serial: etims.device_serial,
    environment:   etims.environment,
  })

  if (!isSuccess(response)) {
    return NextResponse.json({ error: response.resultMsg, result_code: response.resultCd }, { status: 422 })
  }

  await supabase
    .from('tenants_etims_settings')
    .update({ initialized_at: new Date().toISOString(), init_response: response })
    .eq('tenant_id', profile.tenant_id)

  return NextResponse.json({ ok: true, result: response })
}
