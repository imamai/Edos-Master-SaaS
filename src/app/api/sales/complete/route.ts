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
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { saleData, items, payments, tenantId, branchId } = await req.json()
    const supabase = serviceClient()

    // 1. Create sale
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({ ...saleData, cashier_id: user.id, branch_id: branchId, tenant_id: tenantId })
      .select()
      .single()

    if (saleErr || !sale) {
      return NextResponse.json({ error: saleErr?.message ?? 'Failed to create sale' }, { status: 400 })
    }

    // 2. Insert sale items
    if (items?.length > 0) {
      const { error: itemsErr } = await supabase
        .from('sale_items')
        .insert(items.map((i: Record<string, unknown>) => ({ ...i, sale_id: sale.id })))
      if (itemsErr) {
        await supabase.from('sales').delete().eq('id', sale.id)
        return NextResponse.json({ error: itemsErr.message }, { status: 400 })
      }
    }

    // 3. Insert payments
    if (payments?.length > 0) {
      const { error: payErr } = await supabase
        .from('payments')
        .insert(payments.map((p: Record<string, unknown>) => ({ ...p, sale_id: sale.id, status: 'completed' })))
      if (payErr) {
        return NextResponse.json({ error: payErr.message }, { status: 400 })
      }
    }

    // 4. Decrement inventory
    if (branchId) {
      for (const item of items as { product_id: string; quantity: number }[]) {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_branch_id: branchId,
          p_quantity: item.quantity,
        })
      }
    }

    // 5. Queue eTIMS submission (non-blocking – failure here must not fail the sale)
    try {
      const { data: etimsSettings } = await supabase
        .from('tenants_etims_settings')
        .select('is_enabled')
        .eq('tenant_id', tenantId)
        .single()

      if (etimsSettings?.is_enabled) {
        // Add to queue immediately for offline resilience
        await supabase.from('etims_queue').upsert({
          tenant_id:       tenantId,
          sale_id:         sale.id,
          idempotency_key: `${tenantId}:${sale.id}`,
          status:          'pending',
          next_attempt_at: new Date().toISOString(),
        }, { onConflict: 'idempotency_key' })

        // Fire-and-forget real-time Edge Function call
        const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/etims-submit-invoice`
        fetch(edgeUrl, {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({ saleId: sale.id, tenantId }),
        }).catch((err) => console.warn('eTIMS async submit error:', err))
      }
    } catch (etimsErr) {
      console.warn('eTIMS queue error (non-fatal):', etimsErr)
    }

    return NextResponse.json({ sale })
  } catch (err) {
    console.error('Complete sale error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
