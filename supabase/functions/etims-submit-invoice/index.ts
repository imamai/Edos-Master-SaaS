// Supabase Edge Function: etims-submit-invoice
// Called by Next.js API after a sale is created.
// Fetches sale data, builds eTIMS payload, submits to KRA, stores result.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ETIMS_URLS = {
  sandbox:    'https://etims-sbx.kra.go.ke/etims-api',
  production: 'https://etims.kra.go.ke/etims-api',
}

function round2(n: number) { return Math.round(n * 100) / 100 }

function taxBreakdown(total: number, rate: number) {
  if (rate === 0) return { taxblAmt: round2(total), taxAmt: 0 }
  const taxblAmt = round2(total / (1 + rate))
  return { taxblAmt, taxAmt: round2(total - taxblAmt) }
}

const TAX_RATES: Record<string, number> = { A: 0, B: 0.16, C: 0, D: 0.08, E: 0 }
const PAYMENT_CODES: Record<string, string> = {
  cash: '01', credit: '02', card: '03', mpesa: '04', split: '01',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { saleId, tenantId } = await req.json() as { saleId: string; tenantId: string }
    if (!saleId || !tenantId) {
      return new Response(JSON.stringify({ error: 'saleId and tenantId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Check idempotency – skip if already submitted
    const { data: existing } = await supabase
      .from('etims_invoices')
      .select('id, status, irn')
      .eq('sale_id', saleId)
      .single()

    if (existing?.status === 'submitted' || existing?.status === 'confirmed') {
      return new Response(JSON.stringify({ ok: true, cached: true, irn: existing.irn }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Fetch eTIMS settings for tenant
    const { data: etims } = await supabase
      .from('tenants_etims_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (!etims?.is_enabled || !etims?.kra_pin) {
      return new Response(JSON.stringify({ ok: false, error: 'eTIMS not enabled for tenant' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Fetch sale + items + tenant info
    const [{ data: sale }, { data: tenant }] = await Promise.all([
      supabase
        .from('sales')
        .select('*, customers(name, phone), profiles!cashier_id(full_name), sale_items(*, products(name, sku, etims_item_cls_cd, etims_tax_type_cd))')
        .eq('id', saleId)
        .single(),
      supabase
        .from('tenants')
        .select('name, receipt_header, receipt_footer, metadata')
        .eq('id', tenantId)
        .single(),
    ])

    if (!sale || !tenant) {
      return new Response(JSON.stringify({ error: 'Sale or tenant not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Claim a sequential invoice number (atomic)
    const { data: invoiceNoData, error: seqErr } = await supabase
      .rpc('claim_etims_invoice_no', { p_tenant_id: tenantId })

    if (seqErr || !invoiceNoData) {
      throw new Error(`Failed to claim invoice number: ${seqErr?.message}`)
    }
    const invoiceNo = Number(invoiceNoData)

    // 5. Build payload
    const customer   = sale.customers as Record<string, string> | null
    const cashier    = (sale as Record<string, unknown>).profiles as Record<string, string> | null
    const items      = (sale.sale_items as Record<string, unknown>[]) ?? []
    const meta       = (tenant.metadata || {}) as Record<string, string>

    const buckets: Record<string, { taxblAmt: number; taxAmt: number }> = {
      A: { taxblAmt: 0, taxAmt: 0 }, B: { taxblAmt: 0, taxAmt: 0 },
      C: { taxblAmt: 0, taxAmt: 0 }, D: { taxblAmt: 0, taxAmt: 0 },
      E: { taxblAmt: 0, taxAmt: 0 },
    }

    const itemList = items.map((item: Record<string, unknown>, idx: number) => {
      const prod    = (item.products as Record<string, unknown>) || {}
      const taxCat  = (prod.etims_tax_type_cd as string) || 'B'
      const rate    = TAX_RATES[taxCat] ?? 0.16
      const total   = Number(item.total)
      const { taxblAmt, taxAmt } = taxBreakdown(total, rate)

      buckets[taxCat].taxblAmt = round2(buckets[taxCat].taxblAmt + taxblAmt)
      buckets[taxCat].taxAmt   = round2(buckets[taxCat].taxAmt   + taxAmt)

      const qty   = Number(item.quantity)
      const price = Number(item.unit_price)
      const disc  = Number(item.discount || 0)

      return {
        itemSeq:       idx + 1,
        itemCd:        (prod.sku as string) || `ITEM-${idx + 1}`,
        itemClsCd:     (prod.etims_item_cls_cd as string) || '10101501',
        itemNm:        (prod.name as string) || String(item.product_name),
        bcd:           (prod.sku as string) || null,
        pkgUnitCd:     'U', pkg: qty, qtyUnitCd: 'U', qty,
        prc:           round2(price),
        splyAmt:       round2(price * qty),
        dcRt:          disc > 0 ? round2((disc / (price * qty)) * 100) : 0,
        dcAmt:         round2(disc),
        isrccCd: null, isrccNm: null, isrcRt: null, isrcAmt: null,
        vatCatCd:      taxCat,
        exciseTxCatCd: null,
        taxblAmt, taxAmt,
        totAmt:        round2(total),
      }
    })

    const salesDt = new Date(sale.created_at as string)
      .toISOString().replace(/\D/g, '').slice(0, 8)

    const payload = {
      tin:      etims.kra_pin,
      bhfId:    etims.branch_id,
      invcNo:   invoiceNo,
      orgInvcNo: 0,
      cisInvcNo: '',
      custTin:  null,
      custNm:   customer?.name || 'Walk-in Customer',
      salesSttsCd: '02',
      rcptTyCd: 'S',
      pmtTyCd:  PAYMENT_CODES[sale.payment_method as string] || '01',
      salesDt,
      stockRlsDt: null, cnclReqDt: null, cnclDt: null, rfdDt: null, rfdRsnCd: null,
      totItemCnt: items.length,
      taxblAmtA: buckets.A.taxblAmt, taxblAmtB: buckets.B.taxblAmt,
      taxblAmtC: buckets.C.taxblAmt, taxblAmtD: buckets.D.taxblAmt,
      taxblAmtE: buckets.E.taxblAmt,
      taxAmtA:   buckets.A.taxAmt,   taxAmtB:   buckets.B.taxAmt,
      taxAmtC:   buckets.C.taxAmt,   taxAmtD:   buckets.D.taxAmt,
      taxAmtE:   buckets.E.taxAmt,
      totTaxblAmt: round2(Object.values(buckets).reduce((s, b) => s + b.taxblAmt, 0)),
      totTaxAmt:   round2(Object.values(buckets).reduce((s, b) => s + b.taxAmt,   0)),
      totAmt: round2(Number(sale.total)),
      prchrAcptcYn: 'N',
      remark:   (sale.notes as string) || null,
      regrId:   cashier?.full_name || 'cashier',
      regrNm:   cashier?.full_name || 'cashier',
      modrId:   cashier?.full_name || 'cashier',
      modrNm:   cashier?.full_name || 'cashier',
      receipt: {
        custTin:      null,
        custMblNo:    customer?.phone || null,
        rptNo:        invoiceNo,
        trdeNm:       tenant.name,
        adrs:         meta.address || '',
        topMsg:       tenant.receipt_header || 'Thank you for shopping with us',
        btmMsg:       tenant.receipt_footer || 'Please keep this receipt',
        prchrAcptcYn: 'N',
      },
      itemList,
    }

    // 6. Create/update etims_invoices record (pending)
    const { data: invRecord } = await supabase
      .from('etims_invoices')
      .upsert({
        tenant_id:       tenantId,
        sale_id:         saleId,
        etims_invoice_no: invoiceNo,
        status:          'pending',
        request_payload: payload,
      }, { onConflict: 'sale_id' })
      .select('id')
      .single()

    // 7. Submit to KRA API
    const baseUrl = ETIMS_URLS[etims.environment as 'sandbox' | 'production']
    const kraRes  = await fetch(`${baseUrl}/saveTrnsSalesOsdc`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })

    const kraJson = await kraRes.json() as {
      resultCd: string; resultMsg: string; resultDt: string;
      data?: { invoice?: { irn?: string; qrCode?: string } }
    }

    const success = kraJson.resultCd === '000'
    const irn     = kraJson.data?.invoice?.irn     || null
    const qrCode  = kraJson.data?.invoice?.qrCode  || null

    // 8. Update record with KRA response
    await supabase.from('etims_invoices').update({
      status:           success ? 'submitted' : 'failed',
      irn,
      qr_code:          qrCode,
      result_code:      kraJson.resultCd,
      result_msg:       kraJson.resultMsg,
      response_payload: kraJson,
      submitted_at:     success ? new Date().toISOString() : null,
    }).eq('id', invRecord?.id)

    // 9. Remove from queue if it was queued
    await supabase.from('etims_queue')
      .update({ status: success ? 'done' : 'failed', last_error: success ? null : kraJson.resultMsg })
      .eq('sale_id', saleId)

    return new Response(JSON.stringify({
      ok: success,
      irn,
      qr_code:    qrCode,
      result_code: kraJson.resultCd,
      result_msg:  kraJson.resultMsg,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('etims-submit-invoice error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
