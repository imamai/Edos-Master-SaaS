import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'

const paymentBadge: Record<string, string> = {
  cash: 'bg-gray-100 text-gray-700',
  mpesa: 'bg-green-100 text-green-700',
  card: 'bg-blue-100 text-blue-700',
  credit: 'bg-amber-100 text-amber-700',
  split: 'bg-purple-100 text-purple-700',
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 25

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  let query = supabase
    .from('sales')
    .select('*, customer:customers(name), cashier:profiles(full_name)', { count: 'exact' })
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', params.to + 'T23:59:59')

  const { data: sales, count } = await query

  const totalRevenue = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-sm text-gray-500">{count} transactions · {formatCurrency(totalRevenue)} total</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6" method="get">
        <input
          name="from"
          type="date"
          defaultValue={params.from}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="to"
          type="date"
          defaultValue={params.to}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Filter
        </button>
        <Link href="/sales" className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          Clear
        </Link>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales?.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-blue-600">{sale.receipt_number}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(sale.customer as { name: string } | null)?.name || 'Walk-in'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {(sale.cashier as { full_name: string } | null)?.full_name || '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium uppercase ${paymentBadge[sale.payment_method] || 'bg-gray-100 text-gray-700'}`}>
                    {sale.payment_method}
                  </span>
                  {sale.mpesa_receipt && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{sale.mpesa_receipt}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                  {formatCurrency(sale.total_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(sale.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sales?.length === 0 && (
          <div className="text-center py-12 text-gray-400">No sales found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">Previous</Link>}
            {page < totalPages && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
