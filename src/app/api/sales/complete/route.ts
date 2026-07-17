import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { requireActiveTenant } from '@/lib/billing/guard'

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

    // Derive tenant/branch from the caller's own profile — never trust the
    // client-supplied tenantId/branchId, which would let any authenticated
    // user write sales into another tenant.
    const { data: profile } = await userClient
      .from('profiles')
      .select('tenant_id, branch_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 403 })
    }

    const tenantId = profile.tenant_id
    const branchId = profile.branch_id ?? null

    // Defense-in-depth: middleware already blocks suspended tenants at the
    // edge, this guards the same invariant server-side.
    try {
      await requireActiveTenant(tenantId)
    } catch {
      return NextResponse.json({ error: 'This account has been suspended. Renew your subscription to continue.' }, { status: 403 })
    }

    const { saleData, items, payments } = await req.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in sale' }, { status: 400 })
    }

    const supabase = serviceClient()

    // 0. Verify any M-Pesa payment. STK-push payments are cross-checked against
    // the server-side transaction record instead of trusting the client-supplied
    // {method, amount} pair. Till/Paybill payments have no automated callback —
    // the cashier confirms the customer's SMS and enters the M-Pesa code by hand,
    // so we can only require a reference was actually entered, not verify it.
    if (Array.isArray(payments)) {
      for (const p of payments as Record<string, unknown>[]) {
        if (p.method === 'mpesa_manual') {
          const reference = typeof p.reference === 'string' ? p.reference.trim() : ''
          if (reference.length < 6) {
            return NextResponse.json({ error: 'Enter the M-Pesa confirmation code shown in the customer’s SMS' }, { status: 400 })
          }
          p.reference = reference
          continue
        }

        if (p.method !== 'mpesa') continue

        const checkoutRequestId = p.checkoutRequestId as string | undefined
        if (!checkoutRequestId) {
          return NextResponse.json({ error: 'Missing M-Pesa transaction reference' }, { status: 400 })
        }

        const { data: txn } = await supabase
          .from('mpesa_transactions')
          .select('id, status, amount, mpesa_receipt, sale_id')
          .eq('checkout_request_id', checkoutRequestId)
          .eq('tenant_id', tenantId)
          .single()

        if (!txn || txn.status !== 'completed') {
          return NextResponse.json({ error: 'M-Pesa payment could not be verified' }, { status: 400 })
        }
        if (txn.sale_id) {
          return NextResponse.json({ error: 'This M-Pesa transaction has already been applied to a sale' }, { status: 400 })
        }
        if (Math.ceil(Number(p.amount)) !== Math.round(txn.amount)) {
          return NextResponse.json({ error: 'M-Pesa amount does not match sale amount' }, { status: 400 })
        }

        delete p.checkoutRequestId
        p.reference = txn.mpesa_receipt
        p.mpesa_transaction_id = txn.id
      }
    }

    // 1. Re-price every catalog item from the authoritative products table,
    // scoped to the caller's own tenant — never trust client-supplied
    // unit_price/tax. Custom (non-catalog) items have no catalog price to
    // check against, so the manually entered price is trusted by design —
    // that's the whole point of the feature — but everything else about the
    // line (quantity, discount clamping, tax) is still computed server-side.
    type SaleItemInput = {
      product_id: string | null
      custom_name?: string
      quantity: number
      unit_price?: number
      vat_rate?: number
      discount_amount?: number
    }
    const itemsInput = items as SaleItemInput[]
    const priceMode: 'retail' | 'wholesale' = saleData?.price_mode === 'wholesale' ? 'wholesale' : 'retail'

    const catalogInput = itemsInput.filter((i) => i.product_id)
    const customInput = itemsInput.filter((i) => !i.product_id)

    const productIds = [...new Set(catalogInput.map((i) => i.product_id as string))]
    const { data: products, error: productsErr } = productIds.length > 0
      ? await supabase
          .from('products')
          .select('id, name, sku, selling_price, wholesale_price, vat_rate')
          .eq('tenant_id', tenantId)
          .in('id', productIds)
      : { data: [], error: null }

    if (productsErr) {
      return NextResponse.json({ error: productsErr.message }, { status: 400 })
    }

    const productMap = new Map((products ?? []).map((p) => [p.id, p]))
    if (productMap.size !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are invalid for this tenant' }, { status: 400 })
    }

    let subtotal = 0
    let totalTax = 0

    const catalogPriced = catalogInput.map((i) => {
      const product = productMap.get(i.product_id as string)!
      const quantity = Number(i.quantity) || 0
      const unitPrice = priceMode === 'wholesale' && product.wholesale_price != null
        ? Number(product.wholesale_price)
        : Number(product.selling_price) || 0
      const lineBase = unitPrice * quantity
      const discountAmount = Math.min(Math.max(Number(i.discount_amount) || 0, 0), lineBase)
      const totalPrice = lineBase - discountAmount
      const taxAmount = (totalPrice * (Number(product.vat_rate) || 16)) / 116
      subtotal += lineBase
      totalTax += taxAmount
      return {
        product_id: i.product_id,
        product_name: product.name,
        product_sku: product.sku,
        quantity,
        unit_price: unitPrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_price: totalPrice,
      }
    })

    const customPriced = customInput.map((i) => {
      const name = (i.custom_name ?? '').trim().slice(0, 200)
      const quantity = Math.max(0, Number(i.quantity) || 0)
      const unitPrice = Math.max(0, Number(i.unit_price) || 0)
      const vatRate = Number(i.vat_rate) || 16
      const lineBase = unitPrice * quantity
      const discountAmount = Math.min(Math.max(Number(i.discount_amount) || 0, 0), lineBase)
      const totalPrice = lineBase - discountAmount
      const taxAmount = (totalPrice * vatRate) / 116
      subtotal += lineBase
      totalTax += taxAmount
      return {
        product_id: null,
        product_name: name,
        product_sku: 'CUSTOM',
        quantity,
        unit_price: unitPrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_price: totalPrice,
      }
    })

    if (customPriced.some((i) => !i.product_name || i.quantity <= 0)) {
      return NextResponse.json({ error: 'Custom items need a name and a quantity greater than 0' }, { status: 400 })
    }

    const pricedItems = [...catalogPriced, ...customPriced]

    const discountAmount = Math.min(Math.max(Number(saleData?.discount_amount) || 0, 0), subtotal)
    const totalAmount = subtotal - discountAmount
    const paidAmount = Array.isArray(payments)
      ? (payments as { amount: number }[]).reduce((s, p) => s + (Number(p.amount) || 0), 0)
      : 0

    // 2. Create sale — only whitelisted fields, all money fields server-computed.
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert({
        receipt_number: saleData?.receipt_number ?? `RCP-${Date.now()}`,
        customer_id: saleData?.customer_id ?? null,
        status: saleData?.status ?? 'completed',
        subtotal,
        discount_amount: discountAmount,
        tax_amount: totalTax,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        change_amount: Math.max(0, paidAmount - totalAmount),
        payment_method: saleData?.payment_method,
        price_mode: priceMode,
        cashier_id: user.id,
        branch_id: branchId,
        tenant_id: tenantId,
      })
      .select()
      .single()

    if (saleErr || !sale) {
      return NextResponse.json({ error: saleErr?.message ?? 'Failed to create sale' }, { status: 400 })
    }

    // 3. Insert sale items (a DB trigger deducts product stock on insert — do
    // not also call a separate stock-decrement RPC, which would double-count).
    if (pricedItems.length > 0) {
      const { error: itemsErr } = await supabase
        .from('sale_items')
        .insert(pricedItems.map((i) => ({ ...i, sale_id: sale.id })))
      if (itemsErr) {
        await supabase.from('sales').delete().eq('id', sale.id)
        return NextResponse.json({ error: itemsErr.message }, { status: 400 })
      }
    }

    // 4. Insert payments
    if (payments?.length > 0) {
      const { error: payErr } = await supabase
        .from('payments')
        .insert(payments.map((p: Record<string, unknown>) => ({ ...p, sale_id: sale.id, status: 'completed' })))
      if (payErr) {
        return NextResponse.json({ error: payErr.message }, { status: 400 })
      }

      const mpesaTxnIds = (payments as Record<string, unknown>[])
        .map((p) => p.mpesa_transaction_id as string | undefined)
        .filter((id: string | undefined): id is string => !!id)
      if (mpesaTxnIds.length > 0) {
        await supabase.from('mpesa_transactions').update({ sale_id: sale.id }).in('id', mpesaTxnIds)
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
            'x-internal-secret': process.env.ETIMS_INTERNAL_SECRET ?? '',
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
