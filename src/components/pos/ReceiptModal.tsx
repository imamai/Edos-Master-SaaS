'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Printer, X, FileText, Download } from 'lucide-react'
import InvoiceModal from './InvoiceModal'
import jsPDF from 'jspdf'

interface Props {
  saleId: string
  receiptNumber: string
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantKraPIN?: string
  invoiceTerms?: string
  paymentInstructions?: string
  onClose: () => void
}

export default function ReceiptModal({ saleId, receiptNumber, tenantName, tenantAddress, tenantPhone, tenantKraPIN, invoiceTerms, paymentInstructions, onClose }: Props) {
  const supabase = createClient()
  const printRef = useRef<HTMLDivElement>(null)
  const [sale, setSale] = useState<Record<string, unknown> | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)

  useEffect(() => {
    supabase
      .from('sales')
      .select('*, customers(name, phone), profiles!cashier_id(full_name), sale_items(*, products(name, sku, unit)), payments(method, amount)')
      .eq('id', saleId)
      .single()
      .then(({ data }) => { if (data) setSale(data as Record<string, unknown>) })
  }, [saleId])

  function handleDownloadPDF() {
    if (!sale) return
    const customer = (sale.customers as { name: string } | null)
    const cashier = (sale.profiles as { full_name: string } | null)
    const saleItems = (sale.sale_items as Record<string, unknown>[]) ?? []
    const payments = (sale.payments as { method: string; amount: number }[]) ?? []

    // Narrow receipt format: 80mm wide
    const doc = new jsPDF({ unit: 'mm', format: [80, 220], orientation: 'portrait' })
    const W = 80
    const gray: [number, number, number] = [100, 116, 139]
    const dark: [number, number, number] = [30, 41, 59]
    const green: [number, number, number] = [22, 163, 74]
    let y = 8

    const centerText = (text: string, size: number, bold = false) => {
      doc.setFontSize(size)
      doc.setFont('courier', bold ? 'bold' : 'normal')
      doc.text(text, W / 2, y, { align: 'center' })
      y += size * 0.45
    }
    const rowText = (left: string, right: string, size = 8, color: [number, number, number] = dark) => {
      doc.setFontSize(size)
      doc.setFont('courier', 'normal')
      doc.setTextColor(...color)
      doc.text(left, 4, y)
      doc.text(right, W - 4, y, { align: 'right' })
      y += size * 0.45
    }
    const divider = () => { doc.setDrawColor(180); doc.setLineDashPattern([1, 1], 0); doc.line(4, y, W - 4, y); y += 4; doc.setLineDashPattern([], 0) }

    doc.setTextColor(...dark)
    centerText(tenantName, 12, true)
    y += 1
    if (tenantPhone) { doc.setFontSize(8); doc.setTextColor(...gray); doc.text(`Tel: ${tenantPhone}`, W / 2, y, { align: 'center' }); y += 5 }
    divider()

    doc.setTextColor(...dark)
    rowText('Receipt:', String(sale.receipt_number), 8)
    y += 1
    rowText('Date:', formatDateTime(String(sale.created_at)), 8)
    if (customer) { y += 1; rowText('Customer:', customer.name, 8) }
    if (cashier) { y += 1; rowText('Cashier:', cashier.full_name, 8) }
    divider()

    saleItems.forEach((item) => {
      const prod = item.products as Record<string, string> | null
      doc.setFontSize(8); doc.setFont('courier', 'bold'); doc.setTextColor(...dark)
      doc.text(prod?.name ?? 'Item', 4, y); y += 4
      const line = `  ${Number(item.quantity)} x ${formatCurrency(Number(item.unit_price))}`
      rowText(line, formatCurrency(Number(item.total_price)), 8)
      if (Number(item.discount_amount) > 0) { rowText('  Discount', `-${formatCurrency(Number(item.discount_amount))}`, 8, green) }
      y += 1
    })
    divider()

    rowText('Subtotal:', formatCurrency(Number(sale.subtotal)))
    if (Number(sale.discount_amount) > 0) rowText('Discount:', `-${formatCurrency(Number(sale.discount_amount))}`, 8, green)
    rowText('VAT (16%):', formatCurrency(Number(sale.tax_amount)))
    y += 1
    doc.setFontSize(10); doc.setFont('courier', 'bold'); doc.setTextColor(...dark)
    doc.text('TOTAL:', 4, y)
    doc.text(formatCurrency(Number(sale.total_amount)), W - 4, y, { align: 'right' })
    y += 6
    divider()

    payments.forEach((p) => rowText(`${p.method.toUpperCase()}:`, formatCurrency(p.amount)))
    if (Number(sale.change_amount) > 0) {
      doc.setFont('courier', 'bold')
      rowText('CHANGE:', formatCurrency(Number(sale.change_amount)))
    }
    divider()

    doc.setFontSize(8); doc.setFont('courier', 'normal'); doc.setTextColor(...gray)
    doc.text('Thank you for shopping with us!', W / 2, y, { align: 'center' }); y += 5
    doc.text('Goods sold not returnable without', W / 2, y, { align: 'center' }); y += 4
    doc.text('receipt within 7 days', W / 2, y, { align: 'center' })

    doc.save(`Receipt-${String(sale.receipt_number)}.pdf`)
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank', 'width=400,height=600')
    win?.document.write(`<html><head><title>Receipt</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Courier New',monospace;font-size:12px;padding:16px;background:white;color:#000}
      .row{display:flex;justify-content:space-between;margin:2px 0}
      .center{text-align:center}.bold{font-weight:bold}
      .divider{border-top:1px dashed #000;margin:8px 0}
      .green{color:#16a34a}.indent{padding-left:8px}
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

  const customer = (sale.customers as { name: string } | null)
  const cashier = (sale.profiles as { full_name: string } | null)
  const saleItems = (sale.sale_items as Record<string, unknown>[]) ?? []
  const payments = (sale.payments as { method: string; amount: number }[]) ?? []

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm">Receipt</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowInvoice(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition">
                <FileText className="w-3.5 h-3.5" /> Invoice
              </button>
              <button onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div ref={printRef} className="font-mono text-xs text-slate-800 space-y-1">
              <div className="text-center space-y-0.5 pb-2">
                <p className="font-bold" style={{ fontSize: 14 }}>{tenantName}</p>
                {tenantAddress && <p>{tenantAddress}</p>}
                {tenantPhone && <p>Tel: {tenantPhone}</p>}
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
              <div className="flex justify-between"><span>Receipt:</span><span className="font-bold">{String(sale.receipt_number)}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{formatDateTime(String(sale.created_at))}</span></div>
              {customer && <div className="flex justify-between"><span>Customer:</span><span>{customer.name}</span></div>}
              {cashier && <div className="flex justify-between"><span>Cashier:</span><span>{cashier.full_name}</span></div>}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

              {saleItems.map((item, i) => {
                const prod = item.products as Record<string, string> | null
                return (
                  <div key={i} className="mb-1">
                    <p className="font-bold">{prod?.name ?? 'Item'}</p>
                    <div className="flex justify-between pl-2">
                      <span>{Number(item.quantity)} x {formatCurrency(Number(item.unit_price))}</span>
                      <span>{formatCurrency(Number(item.total_price))}</span>
                    </div>
                    {Number(item.discount_amount) > 0 && (
                      <div className="flex justify-between pl-2 text-green-600">
                        <span>Discount</span><span>-{formatCurrency(Number(item.discount_amount))}</span>
                      </div>
                    )}
                  </div>
                )
              })}

              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(Number(sale.subtotal))}</span></div>
              {Number(sale.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount:</span><span>-{formatCurrency(Number(sale.discount_amount))}</span></div>
              )}
              <div className="flex justify-between"><span>VAT (16%):</span><span>{formatCurrency(Number(sale.tax_amount))}</span></div>
              <div className="flex justify-between font-bold" style={{ fontSize: 14 }}>
                <span>TOTAL:</span><span>{formatCurrency(Number(sale.total_amount))}</span>
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
              {payments.map((p, i) => (
                <div key={i} className="flex justify-between"><span>{p.method.toUpperCase()}:</span><span>{formatCurrency(p.amount)}</span></div>
              ))}
              {Number(sale.change_amount) > 0 && (
                <div className="flex justify-between font-bold"><span>CHANGE:</span><span>{formatCurrency(Number(sale.change_amount))}</span></div>
              )}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
              <div className="text-center space-y-0.5">
                <p className="font-bold">Thank you for shopping with us!</p>
                <p>Goods once sold are not returnable</p>
                <p>without receipt within 7 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          saleId={saleId}
          tenantName={tenantName}
          tenantAddress={tenantAddress}
          tenantPhone={tenantPhone}
          tenantKraPIN={tenantKraPIN}
          invoiceTerms={invoiceTerms}
          paymentInstructions={paymentInstructions}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </>
  )
}
