'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import QuotationModal, { type QuotationLineItem } from '@/components/pos/QuotationModal'
import ExportMenu from '@/components/shared/ExportMenu'

interface Quotation {
  id: string
  quote_number: string
  status: string | null
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  valid_until: string | null
  notes: string | null
  created_at: string
  customer: { name: string; phone?: string } | null
}

interface Props {
  quotations: Quotation[]
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantKraPIN?: string
  quotationNotes?: string
}

const statusBadge: Record<string, string> = {
  draft: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300',
  sent: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  accepted: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  expired: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
}

export default function QuotationsHistoryClient({ quotations, tenantName, tenantAddress, tenantPhone, tenantKraPIN, quotationNotes }: Props) {
  const supabase = createClient()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ quotation: Quotation; items: QuotationLineItem[] } | null>(null)

  async function openQuotation(q: Quotation) {
    setLoadingId(q.id)
    const { data, error } = await supabase
      .from('quotation_items')
      .select('*, product:products(name, sku, unit)')
      .eq('quotation_id', q.id)

    setLoadingId(null)
    if (error) { toast.error('Could not load quotation details'); return }

    const items: QuotationLineItem[] = (data ?? []).map((raw) => {
      const row = raw as Record<string, unknown>
      const product = row.product as { name: string; sku: string; unit: string } | null
      return {
        productId: (row.product_id as string | null) ?? undefined,
        name: (row.item_name as string | null) ?? product?.name ?? 'Item',
        sku: (row.item_sku as string | null) ?? product?.sku ?? undefined,
        unit: product?.unit ?? 'item',
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price),
        discount_amount: Number(row.discount_amount ?? 0),
        tax_amount: Number(row.tax_amount ?? 0),
        total_price: Number(row.total_price),
      }
    })

    setSelected({ quotation: q, items })
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <ExportMenu
          columns={[
            { header: 'Quote #', key: 'quote_number', width: 16 },
            { header: 'Customer', key: 'customer_name', width: 20 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Subtotal', key: 'subtotal', width: 12 },
            { header: 'Discount', key: 'discount_amount', width: 12 },
            { header: 'VAT', key: 'tax_amount', width: 12 },
            { header: 'Total', key: 'total_amount', width: 12 },
            { header: 'Valid Until', key: 'valid_until', width: 14 },
            { header: 'Date', key: 'created_at', width: 20 },
          ]}
          rows={quotations.map((q) => ({
            quote_number: q.quote_number,
            customer_name: q.customer?.name || 'Walk-in',
            status: q.status ?? 'draft',
            subtotal: q.subtotal,
            discount_amount: q.discount_amount,
            tax_amount: q.tax_amount,
            total_amount: q.total_amount,
            valid_until: q.valid_until ?? '',
            created_at: formatDateTime(q.created_at),
          }))}
          filename={`quotations-${new Date().toISOString().slice(0, 10)}`}
          title="Quotations Report"
        />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quote #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valid Until</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {quotations.map((q) => (
              <tr
                key={q.id}
                onClick={() => openQuotation(q)}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition ${loadingId === q.id ? 'opacity-50' : ''}`}
              >
                <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {q.quote_number}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{q.customer?.name || 'Walk-in'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[q.status ?? 'draft'] || statusBadge.draft}`}>
                    {q.status ?? 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">{formatCurrency(q.total_amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{q.valid_until ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDateTime(q.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {quotations.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">No quotations generated yet</div>
        )}
      </div>

      {selected && (
        <QuotationModal
          items={selected.items}
          customer={selected.quotation.customer}
          subtotal={selected.quotation.subtotal}
          discountAmount={selected.quotation.discount_amount}
          taxAmount={selected.quotation.tax_amount}
          total={selected.quotation.total_amount}
          tenantName={tenantName}
          tenantAddress={tenantAddress}
          tenantPhone={tenantPhone}
          tenantKraPIN={tenantKraPIN}
          quotationNotes={selected.quotation.notes ?? quotationNotes}
          existing={{
            quoteNumber: selected.quotation.quote_number,
            createdAt: selected.quotation.created_at,
            validUntil: selected.quotation.valid_until ?? selected.quotation.created_at,
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
