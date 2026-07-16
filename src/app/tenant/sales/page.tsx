import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import SalesHistoryClient from '@/components/sales/SalesHistoryClient'

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

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, phone, metadata')
    .eq('id', profile.tenant_id)
    .single()

  const meta = (tenant?.metadata ?? {}) as Record<string, string>

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{count} transactions · {formatCurrency(totalRevenue)} total</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6" method="get">
        <input
          name="from"
          type="date"
          defaultValue={params.from}
          className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="to"
          type="date"
          defaultValue={params.to}
          className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Filter
        </button>
        <Link href="/sales" className="border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800">
          Clear
        </Link>
      </form>

      <SalesHistoryClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sales={(sales ?? []) as any}
        tenantName={tenant?.name ?? 'Store'}
        tenantAddress={meta.address || undefined}
        tenantPhone={tenant?.phone ?? undefined}
        tenantKraPIN={meta.kra_pin || undefined}
        invoiceTerms={meta.invoice_terms || undefined}
        paymentInstructions={meta.payment_instructions || undefined}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">Previous</Link>}
            {page < totalPages && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
