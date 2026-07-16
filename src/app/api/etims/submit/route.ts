// Trigger eTIMS submission for a completed sale.
// Called from /api/sales/complete after the sale is created.
// Falls back to queuing if the Edge Function call fails.
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

export async function POST(req: NextRequest) {
  const user = await createClient()
  const { data: { user: authUser } } = await user.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { saleId } = await req.json() as { saleId: string }
  if (!saleId) {
    return NextResponse.json({ error: 'saleId required' }, { status: 400 })
  }

  const supabase = serviceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', authUser.id)
    .single()

  if (!profile?.tenant_id) return NextResponse.json({ error: 'No tenant' }, { status: 403 })
  const tenantId = profile.tenant_id

  const { data: sale } = await supabase
    .from('sales')
    .select('id')
    .eq('id', saleId)
    .eq('tenant_id', tenantId)
    .single()

  if (!sale) return NextResponse.json({ error: 'Sale not found' }, { status: 404 })

  // Check eTIMS is enabled
  const { data: etims } = await supabase
    .from('tenants_etims_settings')
    .select('is_enabled')
    .eq('tenant_id', tenantId)
    .single()

  if (!etims?.is_enabled) {
    return NextResponse.json({ ok: false, message: 'eTIMS not enabled' })
  }

  // Add to queue first (offline-first pattern)
  await supabase.from('etims_queue').upsert({
    tenant_id:       tenantId,
    sale_id:         saleId,
    idempotency_key: `${tenantId}:${saleId}`,
    status:          'pending',
    next_attempt_at: new Date().toISOString(),
  }, { onConflict: 'idempotency_key' })

  // Attempt real-time submission via Edge Function
  try {
    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/etims-submit-invoice`
    const res = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ saleId, tenantId }),
      signal: AbortSignal.timeout(15_000),
    })
    const json = await res.json() as Record<string, unknown>
    return NextResponse.json(json)
  } catch (err) {
    // Network/timeout – queue will retry later
    console.warn('eTIMS real-time submit failed, queued for retry:', err)
    return NextResponse.json({ ok: false, queued: true, error: String(err) })
  }
}
