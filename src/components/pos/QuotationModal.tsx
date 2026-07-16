'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { Printer, X, Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface QuotationLineItem {
  productId?: string
  name: string
  sku?: string
  unit: string
  quantity: number
  unit_price: number
  discount_amount?: number
  tax_amount?: number
  total_price: number
}

interface SaveContext {
  tenantId: string
  branchId: string | null
  cashierId: string
  customerId?: string | null
}

interface ExistingQuotation {
  quoteNumber: string
  createdAt: string
  validUntil: string
}

interface Props {
  items: QuotationLineItem[]
  customer: { name: string; phone?: string } | null
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantKraPIN?: string
  quotationNotes?: string
  onClose: () => void
  /** Present when generating a brand-new quotation — saves it to the
   *  database once on open. Omit when reopening an already-saved one. */
  saveContext?: SaveContext
  /** Present when reopening a previously-saved quotation — uses its real
   *  quote number/dates instead of generating new ones, and skips saving. */
  existing?: ExistingQuotation
}

function generateQuoteNumber() {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
  return `QT-${date}-${seq}`
}

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

const dateLabel = (d: Date) => d.toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })

export default function QuotationModal({ items, customer, subtotal, discountAmount, taxAmount, total, tenantName, tenantAddress, tenantPhone, tenantKraPIN, quotationNotes, onClose, saveContext, existing }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const savedRef = useRef(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const quoteNumber = useRef(existing?.quoteNumber ?? generateQuoteNumber()).current
  const createdAt = useRef(existing ? new Date(existing.createdAt) : new Date()).current
  const validUntilDate = useRef(existing ? new Date(existing.validUntil) : addDays(createdAt, 7)).current
  const today = dateLabel(createdAt)
  const validity = dateLabel(validUntilDate)

  useEffect(() => {
    if (!saveContext || existing || savedRef.current) return
    savedRef.current = true
    ;(async () => {
      try {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any
        const { data: quote, error } = await db
          .from('quotations')
          .insert({
            tenant_id: saveContext.tenantId,
            branch_id: saveContext.branchId,
            created_by: saveContext.cashierId,
            customer_id: saveContext.customerId ?? null,
            quote_number: quoteNumber,
            valid_until: validUntilDate.toISOString().slice(0, 10),
            subtotal,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            total_amount: total,
            notes: quotationNotes || null,
          })
          .select('id')
          .single()

        if (error || !quote) { setSaveFailed(true); return }

        if (items.length > 0) {
          const { error: itemsErr } = await db.from('quotation_items').insert(
            items.map((i) => ({
              quotation_id: quote.id,
              product_id: i.productId ?? null,
              item_name: i.name,
              item_sku: i.sku ?? null,
              quantity: i.quantity,
              unit_price: i.unit_price,
              discount_amount: i.discount_amount ?? 0,
              tax_amount: i.tax_amount ?? 0,
              total_price: i.total_price,
            }))
          )
          if (itemsErr) setSaveFailed(true)
        }
      } catch {
        setSaveFailed(true)
      }
    })()
    // Save exactly once, on open — not on every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank', 'width=900,height=1200')
    win?.document.write(`<html><head><title>Quotation</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:40px 20px;background:white;line-height:1.5}
      .flex{display:flex}.justify-between{justify-content:space-between}.items-start{align-items:flex-start}
      .text-right{text-align:right}.text-center{text-align:center}
      .mb-6{margin-bottom:1.5rem}.mb-4{margin-bottom:1rem}.mb-2{margin-bottom:.5rem}.mt-8{margin-top:2rem}
      .text-2xl{font-size:22px}.text-3xl{font-size:28px}.text-xs{font-size:11px}.text-sm{font-size:13px}
      .font-bold{font-weight:700}.font-semibold{font-weight:600}.italic{font-style:italic}
      .text-blue-700{color:#1e40af}.text-slate-500{color:#64748b}.text-slate-800{color:#1e293b}.text-green-600{color:#16a34a}
      hr{border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0}
      table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
      th{padding:10px 12px;font-size:12px;font-weight:600;text-align:left;background:#1e40af;color:white;border:1px solid #1e40af}
      th:last-child{text-align:right}
      td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f1f5f9}
      td:last-child{text-align:right}
      tbody tr:nth-child(even){background:#f8fafc}
      .totals{width:16rem}
      .totals div{display:flex;justify-content:space-between;margin-bottom:4px}
      .note-box{background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-top:16px}
      @media print{body{padding:20px}}
    </style></head><body>${content}</body></html>`)
    win?.document.close()
    setTimeout(() => { win?.print(); win?.close() }, 250)
  }

  function handleDownloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const blue: [number, number, number] = [30, 64, 175]
    const gray: [number, number, number] = [100, 116, 139]
    const dark: [number, number, number] = [30, 41, 59]
    const amber: [number, number, number] = [180, 83, 9]

    doc.setFontSize(20)
    doc.setTextColor(...blue)
    doc.setFont('helvetica', 'bold')
    doc.text(tenantName, 15, 22)

    doc.setFontSize(18)
    doc.text('QUOTATION', 195, 22, { align: 'right' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...gray)
    let leftInfoY = 28
    if (tenantAddress) { doc.text(tenantAddress, 15, leftInfoY); leftInfoY += 5 }
    if (tenantPhone) { doc.text(`Tel: ${tenantPhone}`, 15, leftInfoY); leftInfoY += 5 }
    if (tenantKraPIN) doc.text(`KRA PIN: ${tenantKraPIN}`, 15, leftInfoY)
    doc.text(`Quote #: ${quoteNumber}`, 195, 28, { align: 'right' })
    doc.text(`Date: ${today}`, 195, 33, { align: 'right' })
    doc.text(`Valid Until: ${validity}`, 195, 38, { align: 'right' })

    doc.setDrawColor(226, 232, 240)
    doc.line(15, 43, 195, 43)

    doc.setFontSize(8)
    doc.setTextColor(...gray)
    doc.setFont('helvetica', 'bold')
    doc.text('PREPARED FOR', 15, 50)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...dark)
    if (customer) {
      doc.text(customer.name, 15, 56)
      if (customer.phone) doc.text(`Tel: ${customer.phone}`, 15, 61)
    } else {
      doc.setTextColor(...gray)
      doc.text('General Quotation', 15, 56)
    }

    autoTable(doc, {
      startY: 68,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: items.map((item, i) => [
        String(i + 1),
        item.name,
        `${item.quantity} ${item.unit}`.trim(),
        formatCurrency(item.unit_price),
        formatCurrency(item.total_price),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
    const totalsX = 130

    doc.setFontSize(9)
    doc.setTextColor(...gray)
    doc.text('Subtotal', totalsX, afterTable + 6)
    doc.setTextColor(...dark)
    doc.text(formatCurrency(subtotal), 195, afterTable + 6, { align: 'right' })

    if (discountAmount > 0) {
      doc.setTextColor(22, 163, 74)
      doc.text('Discount', totalsX, afterTable + 12)
      doc.text(`-${formatCurrency(discountAmount)}`, 195, afterTable + 12, { align: 'right' })
    }

    doc.setTextColor(...gray)
    doc.text('VAT (16%)', totalsX, afterTable + 18)
    doc.setTextColor(...dark)
    doc.text(formatCurrency(taxAmount), 195, afterTable + 18, { align: 'right' })

    doc.setDrawColor(...blue)
    doc.line(totalsX, afterTable + 21, 195, afterTable + 21)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...blue)
    doc.text('TOTAL', totalsX, afterTable + 27)
    doc.text(formatCurrency(total), 195, afterTable + 27, { align: 'right' })

    // Validity note
    const noteY = afterTable + 38
    doc.setFillColor(254, 252, 232)
    doc.setDrawColor(253, 230, 138)
    doc.roundedRect(15, noteY, 180, 18, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...amber)
    doc.text('QUOTATION NOTES', 19, noteY + 6)
    doc.setFont('helvetica', 'normal')
    doc.text(`• This quotation is valid until ${validity}.`, 19, noteY + 11)
    doc.text(quotationNotes ? `• ${quotationNotes.split('\n')[0]}` : '• Prices subject to change. This is not a tax invoice.', 19, noteY + 16)

    doc.save(`Quotation-${quoteNumber}.pdf`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transition-colors">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-800 dark:text-white">Quotation</span>
            {saveFailed && (
              <span className="text-xs text-amber-600 dark:text-amber-400">— couldn&apos;t save to history, but you can still download/print</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div ref={printRef} className="bg-white text-slate-800 p-8 max-w-2xl mx-auto text-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-2xl font-bold text-blue-700">{tenantName}</p>
                <div className="text-slate-500 text-xs mt-1 space-y-0.5">
                  {tenantAddress && <p>{tenantAddress}</p>}
                  {tenantPhone && <p>Tel: {tenantPhone}</p>}
                  {tenantKraPIN && <p>KRA PIN: {tenantKraPIN}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-700">QUOTATION</p>
                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <p><span className="font-semibold text-slate-700">Quote #:</span> {quoteNumber}</p>
                  <p><span className="font-semibold text-slate-700">Date:</span> {today}</p>
                  <p><span className="font-semibold text-slate-700">Valid Until:</span> {validity}</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-4" />

            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Prepared For</p>
              {customer ? (
                <div>
                  <p className="font-semibold text-slate-800">{customer.name}</p>
                  {customer.phone && <p className="text-slate-500 text-xs">Tel: {customer.phone}</p>}
                </div>
              ) : (
                <p className="text-slate-500 italic">General Quotation</p>
              )}
            </div>

            <table className="w-full border-collapse mb-6 text-sm">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">#</th>
                  <th className="text-left px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Description</th>
                  <th className="text-center px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Qty</th>
                  <th className="text-right px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Unit Price</th>
                  <th className="text-right px-3 py-2.5 bg-blue-700 text-white font-semibold text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.productId ?? i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                    <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium">{item.name}</td>
                    <td className="px-3 py-2.5 text-center">{item.quantity} {item.unit}</td>
                    <td className="px-3 py-2.5 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-64 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discountAmount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">VAT (16%)</span><span>{formatCurrency(taxAmount)}</span></div>
                <div className="flex justify-between font-bold text-blue-700 border-t border-blue-200 pt-2 mt-1 text-base">
                  <span>TOTAL</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Quotation Notes</p>
              <p>• This quotation is valid until <strong>{validity}</strong>.</p>
              {quotationNotes ? (
                <p className="whitespace-pre-line">{quotationNotes}</p>
              ) : (
                <>
                  <p>• Prices are subject to change without prior notice.</p>
                  <p>• This is not a tax invoice — payment not implied.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
