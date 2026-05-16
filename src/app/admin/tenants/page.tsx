import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, AlertTriangle, Search } from 'lucide-react'
import Link from 'next/link'

const statusConfig = {
  active: { label: 'Active', className: 'text-green-700 bg-green-100' },
  trial: { label: 'Trial', className: 'text-blue-700 bg-blue-100' },
  grace_period: { label: 'Grace Period', className: 'text-amber-700 bg-amber-100' },
  suspended: { label: 'Suspended', className: 'text-red-700 bg-red-100' },
  cancelled: { label: 'Cancelled', className: 'text-gray-700 bg-gray-100' },
}

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const status = params.status || ''
  const page = parseInt(params.page || '1')
  const pageSize = 20

  const supabase = await createClient()

  let query = supabase
    .from('tenants')
    .select(`
      id, name, subdomain, status, owner_email, owner_name, created_at, trial_ends_at,
      plan:plans(name, price_monthly),
      subscriptions(amount, status, billing_cycle)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (q) query = query.ilike('name', `%${q}%`)
  if (status) query = query.eq('status', status)

  const { data: tenants, count } = await query
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500">{count} total businesses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={status}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="grace_period">Grace Period</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Business</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants?.map((tenant) => {
              const cfg = statusConfig[tenant.status as keyof typeof statusConfig]
              const sub = Array.isArray(tenant.subscriptions) ? tenant.subscriptions[0] : null
              return (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{tenant.name}</p>
                    <p className="text-xs text-gray-400">{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{tenant.owner_name}</p>
                    <p className="text-xs text-gray-400">{tenant.owner_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{(tenant.plan as { name: string } | null)?.name || '—'}</p>
                    {sub && <p className="text-xs text-gray-400">{formatCurrency(sub.amount)}/{sub.billing_cycle}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {cfg && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(tenant.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/tenants/${tenant.id}`}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {tenants?.length === 0 && (
          <div className="text-center py-12 text-gray-400">No tenants found</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count || 0)} of {count}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`?page=${page - 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={`?page=${page + 1}${q ? `&q=${q}` : ''}${status ? `&status=${status}` : ''}`}
                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
