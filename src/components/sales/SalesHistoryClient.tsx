'use client'

import { useState } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import ReceiptModal from '@/components/pos/ReceiptModal'
import ExportMenu from '@/components/shared/ExportMenu'

interface Sale {
  id: string
  receipt_number: string
  payment_method: string
  mpesa_receipt?: string | null
  total_amount: number
  created_at: string
  customer: { name: string } | null
  cashier: { full_name: string } | null
}

interface Props {
  sales: Sale[]
  tenantName: string
  tenantAddress?: string
  tenantPhone?: string
  tenantKraPIN?: string
  invoiceTerms?: string
  paymentInstructions?: string
}

const paymentBadge: Record<string, string> = {
  cash: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300',
  mpesa: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  mpesa_manual: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  card: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  credit: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  split: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
}

export default function SalesHistoryClient({ sales, tenantName, tenantAddress, tenantPhone, tenantKraPIN, invoiceTerms, paymentInstructions }: Props) {
  const [selected, setSelected] = useState<Sale | null>(null)

  return (
    <>
      <div className="flex justify-end mb-3">
        <ExportMenu
          columns={[
            { header: 'Receipt #', key: 'receipt_number', width: 16 },
            { header: 'Customer', key: 'customer_name', width: 20 },
            { header: 'Cashier', key: 'cashier_name', width: 18 },
            { header: 'Payment Method', key: 'payment_method', width: 14 },
            { header: 'M-Pesa Receipt', key: 'mpesa_receipt', width: 16 },
            { header: 'Total', key: 'total_amount', width: 12 },
            { header: 'Date & Time', key: 'created_at', width: 20 },
          ]}
          rows={sales.map((s) => ({
            receipt_number: s.receipt_number,
            customer_name: s.customer?.name || 'Walk-in',
            cashier_name: s.cashier?.full_name || '—',
            payment_method: s.payment_method,
            mpesa_receipt: s.mpesa_receipt || '',
            total_amount: s.total_amount,
            created_at: formatDateTime(s.created_at),
          }))}
          filename={`sales-history-${new Date().toISOString().slice(0, 10)}`}
          title="Sales History Report"
        />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipt #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cashier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {sales.map((sale) => (
              <tr key={sale.id} onClick={() => setSelected(sale)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{sale.receipt_number}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {sale.customer?.name || 'Walk-in'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {sale.cashier?.full_name || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase ${paymentBadge[sale.payment_method] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}>
                    {sale.payment_method}
                  </span>
                  {sale.mpesa_receipt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{sale.mpesa_receipt}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white">
                  {formatCurrency(sale.total_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDateTime(sale.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">No sales found</div>
        )}
      </div>

      {selected && (
        <ReceiptModal
          saleId={selected.id}
          receiptNumber={selected.receipt_number}
          tenantName={tenantName}
          tenantAddress={tenantAddress}
          tenantPhone={tenantPhone}
          tenantKraPIN={tenantKraPIN}
          invoiceTerms={invoiceTerms}
          paymentInstructions={paymentInstructions}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
