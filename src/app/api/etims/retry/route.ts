// Manually retry a failed eTIMS submission for a specific sale.
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

  const { saleId, tenantId } = await req.json() as { saleId: string; tenantId: string }
  if (!saleId || !tenantId) {
    return NextResponse.json({ error: 'saleId and tenantId required' }, { status: 400 })
  }

  const supabase = serviceClient()

  // Reset queue entry so it will be picked up immediately
  await supabase.from('etims_queue').upsert({
    tenant_id:       tenantId,
    sale_id:         saleId,
    idempotency_key: `${tenantId}:${saleId}`,
    status:          'pending',
    next_attempt_at: new Date().toISOString(),
  }, { onConflict: 'idempotency_key' })

  // Also reset the invoice record so it can be resubmitted
  await supabase.from('etims_invoices')
    .update({ status: 'pending' })
    .eq('sale_id', saleId)
    .eq('tenant_id', tenantId)

  try {
    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/etims-submit-invoice`
    const res = await fetch(edgeUrl, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type':  'application/json',
      },
      body:   JSON.stringify({ saleId, tenantId }),
      signal: AbortSignal.timeout(15_000),
    })
    const json = await res.json()
    return NextResponse.json(json)
  } catch (err) {
    return NextResponse.json({ ok: false, queued: true, error: String(err) })
  }
}
