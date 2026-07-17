import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-700',
}

export default async function BillingInvoicesPage() {
  const supabase = await createServiceClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, tenant:tenants(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500">{invoices?.length ?? 0} recent invoices</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices?.map((inv) => {
              const t = inv.tenant as unknown as { name: string } | null
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{inv.invoice_number ?? inv.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{inv.billing_reason ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[inv.status ?? 'pending']}`}>
                      {inv.status ?? 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(inv.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!invoices || invoices.length === 0) && <div className="text-center py-12 text-gray-400">No invoices yet</div>}
      </div>
    </div>
  )
}
