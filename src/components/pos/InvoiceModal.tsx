'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer, X, Download, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface EtimsStatus {
  status:    'pending' | 'submitted' | 'confirmed' | 'failed' | null
  irn:       string | null
  qr_code:   string | null
  result_msg: string | null
}

interface Props {
  saleId: string
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantKraPIN?: string
  invoiceTerms?: string
  paymentInstructions?: string
  onClose: () => void
}

export default function InvoiceModal({ saleId, tenantName, tenantAddress, tenantPhone, tenantKraPIN, invoiceTerms, paymentInstructions, onClose }: Props) {
  const supabase = createClient()
  const printRef = useRef<HTMLDivElement>(null)
  const [sale, setSale] = useState<Record<string, unknown> | null>(null)
  const [etims, setEtims] = useState<EtimsStatus | null>(null)

  useEffect(() => {
    supabase
      .from('sales')
      .select('*, customers(name, phone, kra_pin), profiles!cashier_id(full_name), sale_items(*, products(name, sku, unit)), payments(method, amount)')
      .eq('id', saleId)
      .single()
      .then(({ data }) => { if (data) setSale(data as Record<string, unknown>) })

    // Load eTIMS status for this invoice
    supabase
      .from('etims_invoices')
      .select('status, irn, qr_code, result_msg')
      .eq('sale_id', saleId)
      .single()
      .then(({ data }) => {
        if (data) setEtims(data as EtimsStatus)
      })
  }, [saleId])

  function handleDownloadPDF() {
    if (!sale) return
    const customer = sale.customers as Record<string, string> | null
    const cashier = (sale as Record<string, unknown>).profiles as Record<string, string> | null
    const items = (sale.sale_items as Record<string, unknown>[]) ?? []
    const payments = (sale.payments as { method: string; amount: number }[]) ?? []

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const blue: [number, number, number] = [30, 64, 175]
    const gray: [number, number, number] = [100, 116, 139]
    const dark: [number, number, number] = [30, 41, 59]

    // Header — left: company info, right: TAX INVOICE + details
    doc.setFontSize(20)
    doc.setTextColor(...blue)
    doc.setFont('helvetica', 'bold')
    doc.text(tenantName, 15, 22)

    doc.setFontSize(18)
    doc.text('TAX INVOICE', 195, 22, { align: 'right' })

    let leftY = 28
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    if (tenantAddress) { doc.text(tenantAddress, 15, leftY); leftY += 5 }
    if (tenantPhone) { doc.text(`Tel: ${tenantPhone}`, 15, leftY); leftY += 5 }
    if (tenantKraPIN) doc.text(`KRA PIN: ${tenantKraPIN}`, 15, leftY)

    doc.text(`Invoice #: ${String(sale.receipt_number)}`, 195, 28, { align: 'right' })
    doc.text(`Date: ${formatDate(String(sale.created_at))}`, 195, 33, { align: 'right' })
    doc.text(`Cashier: ${cashier?.full_name ?? '—'}`, 195, 38, { align: 'right' })

    doc.setDrawColor(226, 232, 240)
    doc.line(15, 43, 195, 43)

    // Bill To
    doc.setFontSize(8)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO', 15, 50)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...dark)
    if (customer) {
      doc.text(customer.name, 15, 56)
      let billToY = 56
      if (customer.phone) { billToY += 5; doc.text(`Tel: ${customer.phone}`, 15, billToY) }
      if (customer.kra_pin) { billToY += 5; doc.text(`PIN: ${customer.kra_pin}`, 15, billToY) }
    } else {
      doc.setTextColor(...gray)
      doc.text('Walk-in Customer', 15, 56)
    }

    // Items table
    autoTable(doc, {
      startY: 74,
      head: [['#', 'Description', 'SKU', 'Qty', 'Unit Price', 'Amount']],
      body: items.map((item, i) => {
        const prod = item.products as Record<string, string> | null
        return [
          String(i + 1),
          (item.product_name as string | null) ?? prod?.name ?? '—',
          (item.product_sku as string | null) ?? prod?.sku ?? '—',
          `${Number(item.quantity)} ${prod?.unit ?? ''}`.trim(),
          formatCurrency(Number(item.unit_price)),
          formatCurrency(Number(item.total_price)),
        ]
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5

    // Totals
    const totalsX = 130
    doc.setFontSize(9)
    doc.setTextColor(...gray)
    doc.text('Subtotal', totalsX, afterTable + 6)
    doc.setTextColor(...dark)
    doc.text(formatCurrency(Number(sale.subtotal)), 195, afterTable + 6, { align: 'right' })

    if (Number(sale.discount_amount) > 0) {
      doc.setTextColor(22, 163, 74)
      doc.text('Discount', totalsX, afterTable + 12)
      doc.text(`-${formatCurrency(Number(sale.discount_amount))}`, 195, afterTable + 12, { align: 'right' })
    }

    doc.setTextColor(...gray)
    doc.text('VAT (16%)', totalsX, afterTable + 18)
    doc.setTextColor(...dark)
    doc.text(formatCurrency(Number(sale.tax_amount)), 195, afterTable + 18, { align: 'right' })

    doc.setDrawColor(...blue)
    doc.line(totalsX, afterTable + 21, 195, afterTable + 21)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...blue)
    doc.text('TOTAL', totalsX, afterTable + 27)
    doc.text(formatCurrency(Number(sale.total_amount)), 195, afterTable + 27, { align: 'right' })

    // Payment box
    const pyY = afterTable + 35
    const pyRows = payments.length + (paymentInstructions ? 2 : 0)
    doc.setFillColor(240, 249, 255)
    doc.setDrawColor(186, 230, 253)
    doc.roundedRect(15, pyY, 80, 6 + pyRows * 7, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...blue)
    doc.text('PAYMENT DETAILS', 19, pyY + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...dark)
    payments.forEach((p, i) => {
      doc.text(p.method.toUpperCase(), 19, pyY + 11 + i * 7)
      doc.text(formatCurrency(p.amount), 91, pyY + 11 + i * 7, { align: 'right' })
    })
    if (paymentInstructions) {
      const instrY = pyY + 11 + payments.length * 7
      doc.setTextColor(...gray)
      doc.text(paymentInstructions.split('\n')[0], 19, instrY)
    }

    // Footer
    const footY = pyY + 10 + pyRows * 7 + 10
    doc.setDrawColor(226, 232, 240)
    doc.line(15, footY, 195, footY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    const terms = invoiceTerms
      ? invoiceTerms.split('\n').filter(Boolean)
      : [
          '• Goods once sold are not returnable without this invoice within 7 days.',
          '• This is a computer-generated document and does not require a physical signature.',
        ]
    terms.forEach((line, i) => doc.text(line, 15, footY + 6 + i * 5))

    doc.save(`Invoice-${String(sale.receipt_number)}.pdf`)
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank', 'width=900,height=1200')
    win?.document.write(`<html><head><title>Invoice</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:40px 20px;background:white;line-height:1.5}
      .flex{display:flex}.justify-between{justify-content:space-between}.items-start{align-items:flex-start}
      .w-full{width:100%}.text-right{text-align:right}.text-center{text-align:center}
      .mb-6{margin-bottom:1.5rem}.mb-4{margin-bottom:1rem}.mb-2{margin-bottom:.5rem}.mt-2{margin-top:.5rem}.mt-8{margin-top:2rem}.pt-2{padding-top:.5rem}
      .text-2xl{font-size:22px}.text-3xl{font-size:28px}.text-xs{font-size:11px}.text-sm{font-size:13px}
      .font-bold{font-weight:700}.font-semibold{font-weight:600}.font-medium{font-weight:500}.italic{font-style:italic}.uppercase{text-transform:uppercase}
      .text-blue-700{color:#1e40af}.text-slate-500{color:#64748b}.text-slate-800{color:#1e293b}.text-green-600{color:#16a34a}
      hr{border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0}
      table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
      th{padding:10px 12px;font-size:12px;font-weight:600;text-align:left;background:#1e40af;color:white;border:1px solid #1e40af}
      th:last-child,th:nth-child(5){text-align:right}th:nth-child(4){text-align:center}
      td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f1f5f9}
      td:last-child,td:nth-child(5){text-align:right}td:nth-child(4){text-align:center}
      tbody tr:nth-child(even){background:#f8fafc}
      .sig-line{width:10rem;border-top:1px solid #94a3b8;margin-bottom:4px}
      @media print{body{padding:20px}*{page-break-inside:avoid}}
    </style></head><body>${content}</body></html>`)
    win?.document.close()
    setTimeout(() => { win?.print(); win?.close() }, 250)
  }

  if (!sale) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const customer = sale.customers as Record<string, string> | null
  const cashier = (sale as Record<string, unknown>).profiles as Record<string, string> | null
  const items = (sale.sale_items as Record<string, unknown>[]) ?? []
  const payments = (sale.payments as { method: string; amount: number }[]) ?? []
  const isPaid = sale.status === 'completed'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <span className="font-semibold text-slate-800">Tax Invoice</span>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef} className="bg-white text-slate-800 p-8 max-w-2xl mx-auto text-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-2xl font-bold text-blue-700">{tenantName}</p>
                <div className="text-slate-500 mt-1 text-xs leading-relaxed space-y-0.5">
                  {tenantAddress && <p>{tenantAddress}</p>}
                  {tenantPhone && <p>Tel: {tenantPhone}</p>}
                  {tenantKraPIN && <p>KRA PIN: {tenantKraPIN}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-700">TAX INVOICE</p>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p><span className="font-semibold text-slate-700">Invoice #:</span> {String(sale.receipt_number)}</p>
                  <p><span className="font-semibold text-slate-700">Date:</span> {formatDate(String(sale.created_at))}</p>
                  <p><span className="font-semibold text-slate-700">Cashier:</span> {cashier?.full_name ?? '—'}</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-4" />

            {/* Bill To */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</p>
              {customer ? (
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-800">{customer.name}</p>
                  {customer.phone && <p className="text-slate-500">Tel: {customer.phone}</p>}
                  {customer.kra_pin && <p className="text-slate-500">PIN: {customer.kra_pin}</p>}
                </div>
              ) : (
                <p className="text-slate-500 italic">Walk-in Customer</p>
              )}
            </div>

            {/* Items table */}
            <table className="w-full border-collapse mb-6 text-sm">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">#</th>
                  <th className="text-left px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Description</th>
                  <th className="text-left px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">SKU</th>
                  <th className="text-center px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Qty</th>
                  <th className="text-right px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Unit Price</th>
                  <th className="text-right px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const prod = item.products as Record<string, string> | null
                  const itemName = (item.product_name as string | null) ?? prod?.name ?? '—'
                  const itemSku = (item.product_sku as string | null) ?? prod?.sku ?? '—'
                  return (
                    <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                      <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium">{itemName}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-xs">{itemSku}</td>
                      <td className="px-3 py-2.5 text-center">{Number(item.quantity)} {prod?.unit ?? ''}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(Number(item.unit_price))}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(Number(item.total_price))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(Number(sale.subtotal))}</span></div>
                {Number(sale.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(Number(sale.discount_amount))}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">VAT (16%)</span><span>{formatCurrency(Number(sale.tax_amount))}</span></div>
                <div className="flex justify-between font-bold text-blue-700 border-t border-blue-200 pt-2 mt-1 text-base">
                  <span>TOTAL</span><span>{formatCurrency(Number(sale.total_amount))}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">Payment Details</p>
              {payments.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600 capitalize">{p.method}</span>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {Number(sale.change_amount) > 0 && (
                <div className="flex justify-between text-sm text-green-600 mt-1">
                  <span>Change Given</span>
                  <span>{formatCurrency(Number(sale.change_amount))}</span>
                </div>
              )}
              {paymentInstructions && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Payment Instructions</p>
                  <p className="text-xs text-slate-600 whitespace-pre-line">{paymentInstructions}</p>
                </div>
              )}
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {isPaid ? 'PAID' : 'PENDING'}
                </span>
              </div>
            </div>

            {/* eTIMS compliance badge */}
            {etims && (
              <div className={`rounded-xl p-3 mb-4 flex items-start gap-2.5 ${
                etims.status === 'submitted' || etims.status === 'confirmed'
                  ? 'bg-green-50 border border-green-200'
                  : etims.status === 'failed'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {etims.status === 'submitted' || etims.status === 'confirmed'
                  ? <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  : etims.status === 'failed'
                  ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  : <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className={`text-xs font-bold uppercase ${
                    etims.status === 'submitted' || etims.status === 'confirmed' ? 'text-green-700' :
                    etims.status === 'failed' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {etims.status === 'submitted' || etims.status === 'confirmed'
                      ? 'KRA eTIMS Verified Tax Invoice'
                      : etims.status === 'failed' ? 'eTIMS Submission Failed'
                      : 'eTIMS Submission Pending'}
                  </p>
                  {etims.irn && (
                    <p className="text-xs text-gray-600 mt-0.5 break-all">IRN: {etims.irn}</p>
                  )}
                  {etims.qr_code && (
                    <p className="text-xs text-gray-500 mt-0.5 font-mono break-all truncate">QR: {etims.qr_code}</p>
                  )}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="flex justify-between mt-8 mb-4">
              <div className="text-center">
                <div className="w-40 border-t border-slate-300 mb-1" />
                <p className="text-xs text-slate-500">Authorized Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-slate-300 mb-1" />
                <p className="text-xs text-slate-500">Customer Signature</p>
              </div>
            </div>

            <hr className="border-slate-200 my-4" />
            <div className="text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-500">Terms &amp; Conditions</p>
              {invoiceTerms ? (
                <p className="whitespace-pre-line">{invoiceTerms}</p>
              ) : (
                <>
                  <p>• Goods once sold are not returnable without this invoice within 7 days.</p>
                  <p>• This is a computer-generated document and does not require a physical signature.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
