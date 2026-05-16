import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'
import TenantActions from '@/components/admin/TenantActions'

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select(`
      *,
      plan:plans(*),
      subscriptions(*),
      invoices(*)
    `)
    .eq('id', id)
    .single()

  if (!tenant) notFound()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at')

  const { data: salesStats } = await supabase
    .from('sales')
    .select('total, created_at')
    .eq('tenant_id', id)

  const totalSales = salesStats?.reduce((sum, s) => sum + s.total, 0) || 0
  const totalTransactions = salesStats?.length || 0

  const sub = Array.isArray(tenant.subscriptions) ? tenant.subscriptions[0] : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-gray-500 text-sm">{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Business Details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Owner</dt>
                <dd className="font-medium">{tenant.owner_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{tenant.owner_email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{tenant.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Country</dt>
                <dd className="font-medium">{tenant.country}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Currency</dt>
                <dd className="font-medium">{tenant.currency}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Joined</dt>
                <dd className="font-medium">{formatDate(tenant.created_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Trial Ends</dt>
                <dd className="font-medium">{tenant.trial_ends_at ? formatDate(tenant.trial_ends_at) : '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tax</dt>
                <dd className="font-medium">
                  {tenant.tax_enabled ? `${tenant.tax_name} ${tenant.tax_rate}%` : 'Disabled'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>
            {sub ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="font-medium">{(tenant.plan as { name: string } | null)?.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Cycle</dt>
                  <dd className="font-medium capitalize">{sub.billing_cycle}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium">{formatCurrency(sub.amount)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Payment</dt>
                  <dd className="font-medium capitalize">{sub.payment_method}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Period End</dt>
                  <dd className="font-medium">{sub.current_period_end ? formatDate(sub.current_period_end) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Payment</dt>
                  <dd className="font-medium">{sub.last_payment_at ? formatDateTime(sub.last_payment_at) : '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Failed Payments</dt>
                  <dd className={`font-medium ${sub.failed_payment_count > 0 ? 'text-red-600' : ''}`}>
                    {sub.failed_payment_count}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-400 text-sm">No active subscription</p>
            )}
          </div>

          {/* Staff */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Staff ({profiles?.length || 0})</h2>
            <div className="space-y-2">
              {profiles?.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.full_name || p.email}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize">{p.role}</span>
                    <span className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Business Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Sales</span>
                <span className="font-semibold">{formatCurrency(totalSales)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transactions</span>
                <span className="font-semibold">{totalTransactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Staff</span>
                <span className="font-semibold">{profiles?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <TenantActions tenant={tenant} />
        </div>
      </div>
    </div>
  )
}
