import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { po_id } = await request.json() as { po_id: string }

    if (!po_id) {
      return NextResponse.json({ error: 'po_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch PO with supplier and items
    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, email, phone, contact_name),
        items:purchase_order_items!purchase_order_items_po_id_fkey(*)
      `)
      .eq('id', po_id)
      .single()

    if (poErr || !po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    // Fetch tenant info for sender context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, full_name')
      .eq('id', user.id)
      .single()

    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, owner_email, phone, metadata')
      .eq('id', profile?.tenant_id)
      .single()

    const tenantMetadata = (tenant?.metadata ?? {}) as Record<string, unknown>
    const procurementEmail = (tenantMetadata.procurement_email as string) || tenant?.owner_email || undefined
    const tenantAddress = (tenantMetadata.address as string) || ''

    type SupplierObj = { name?: string; email?: string; contact_name?: string }
    const supplier = po.supplier as SupplierObj
    const supplierEmail = supplier?.email

    if (!supplierEmail) {
      return NextResponse.json({ error: 'Supplier has no email address on file' }, { status: 400 })
    }

    type POItem = { product_name: string; quantity: number; unit: string; unit_price: number; vat_amount: number; total: number }
    const items = (po.items ?? []) as POItem[]

    // Build HTML email body
    const itemRows = items.map((it) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; text-align: left;">${it.product_name}</td>
        <td style="padding: 10px 12px; text-align: right;">${it.quantity} ${it.unit ?? 'pcs'}</td>
        <td style="padding: 10px 12px; text-align: right;">KES ${Number(it.unit_price).toFixed(2)}</td>
        <td style="padding: 10px 12px; text-align: right;">KES ${Number(it.vat_amount).toFixed(2)}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600;">KES ${Number(it.total).toFixed(2)}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; max-width: 680px; margin: 0 auto; padding: 24px;">
  <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2563eb;">
    <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #2563eb;">${tenant?.name ?? 'Purchase Order'}</h1>
    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Purchase Order — ${po.po_number}</p>
  </div>

  <p style="margin-bottom: 16px;">Dear ${supplier?.contact_name ?? supplier?.name ?? 'Supplier'},</p>

  <p style="margin-bottom: 20px; color: #475569;">
    Please find below our purchase order <strong>${po.po_number}</strong>.
    ${po.expected_delivery_date ? `We expect delivery by <strong>${new Date(po.expected_delivery_date).toLocaleDateString('en-KE', { dateStyle: 'long' })}</strong>.` : ''}
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #475569;">Product</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #475569;">Qty</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #475569;">Unit Price</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #475569;">VAT</th>
        <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #475569;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr style="background-color: #f8fafc;">
        <td colspan="4" style="padding: 10px 12px; text-align: right; font-weight: 600;">Subtotal</td>
        <td style="padding: 10px 12px; text-align: right;">KES ${Number(po.subtotal ?? 0).toFixed(2)}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td colspan="4" style="padding: 10px 12px; text-align: right; font-weight: 600;">VAT</td>
        <td style="padding: 10px 12px; text-align: right;">KES ${Number(po.vat_amount ?? 0).toFixed(2)}</td>
      </tr>
      <tr style="background-color: #eff6ff;">
        <td colspan="4" style="padding: 12px 12px; text-align: right; font-weight: 700; font-size: 16px; color: #2563eb;">Total Amount</td>
        <td style="padding: 12px 12px; text-align: right; font-weight: 700; font-size: 16px; color: #2563eb;">KES ${Number(po.total_amount ?? 0).toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${po.notes ? `<div style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Notes:</strong> ${po.notes}</p>
  </div>` : ''}

  <p style="margin-bottom: 4px;">Please confirm receipt of this order and advise expected delivery date.</p>
  <p style="color: #64748b; font-size: 14px;">Kindly reference <strong>${po.po_number}</strong> on all correspondence and delivery notes.</p>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8;">
    <p style="margin: 0;"><strong>${tenant?.name ?? ''}</strong></p>
    ${tenantAddress ? `<p style="margin: 2px 0;">${tenantAddress}</p>` : ''}
    ${tenant?.phone ? `<p style="margin: 2px 0;">${tenant.phone}</p>` : ''}
    ${procurementEmail ? `<p style="margin: 2px 0;">${procurementEmail}</p>` : ''}
  </div>
</body>
</html>`

    const { error: emailErr } = await resend.emails.send({
      from: `${tenant?.name ?? 'EdosPoa'} <orders@${process.env.RESEND_FROM_DOMAIN ?? 'edos.co.ke'}>`,
      to: [supplierEmail],
      replyTo: procurementEmail,
      subject: `Purchase Order ${po.po_number} from ${tenant?.name ?? 'us'}`,
      html,
    })

    if (emailErr) {
      return NextResponse.json({ error: emailErr.message }, { status: 500 })
    }

    // Mark PO as sent
    await supabase
      .from('purchase_orders')
      .update({ status: 'sent', email_sent_at: new Date().toISOString() })
      .eq('id', po_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[po/send-email]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
