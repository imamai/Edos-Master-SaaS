import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function BillingOverviewPage() {
  const supabase = await createServiceClient()

  const [tenantsByStatus, subscriptions, pendingPayments, upcomingRenewals] = await Promise.all([
    supabase.from('tenants').select('status'),
    supabase.from('subscriptions').select('amount, status, billing_cycle').eq('status', 'active'),
    supabase.from('subscription_payments').select('id, amount, method, created_at, tenant:tenants(name)').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('current_period_end, amount, tenant:tenants(name, subdomain)')
      .in('status', ['active', 'trialing'])
      .not('current_period_end', 'is', null)
      .lte('current_period_end', new Date(Date.now() + 30 * 86_400_000).toISOString())
      .order('current_period_end', { ascending: true })
      .limit(10),
  ])

  const counts = (tenantsByStatus.data || []).reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const subs = subscriptions.data || []
  const mrr = subs.reduce((sum, s) => {
    if (s.billing_cycle === 'yearly') return sum + (s.amount || 0) / 12
    if (s.billing_cycle === 'semiannual') return sum + (s.amount || 0) / 6
    return sum + (s.amount || 0)
  }, 0)

  const statCards = [
    { label: 'Active', value: counts.active || 0, className: 'text-green-700 bg-green-50' },
    { label: 'Trial', value: counts.trial || 0, className: 'text-blue-700 bg-blue-50' },
    { label: 'Grace Period', value: counts.grace_period || 0, className: 'text-amber-700 bg-amber-50' },
    { label: 'Suspended', value: counts.suspended || 0, className: 'text-red-700 bg-red-50' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500">Subscriptions, payments, and revenue</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.className}`}>
            <p className="text-xs font-medium opacity-70">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 mb-1">MRR</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(mrr)}</p>
          <p className="text-xs text-gray-400 mt-1">{subs.length} active subscriptions</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-gray-900">{pendingPayments.data?.length || 0}</p>
          <Link href="/admin/billing/payments" className="text-xs text-blue-600 hover:underline mt-1 inline-block">Review →</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Upcoming Renewals (30 days)</h2>
          <div className="space-y-2">
            {upcomingRenewals.data?.map((s, i) => {
              const t = s.tenant as unknown as { name: string; subdomain: string } | null
              return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{s.current_period_end ? formatDate(s.current_period_end) : '—'}</p>
                  </div>
                  <p className="text-sm text-gray-600">{formatCurrency(s.amount || 0)}</p>
                </div>
              )
            })}
            {(!upcomingRenewals.data || upcomingRenewals.data.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No renewals due in the next 30 days</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Pending Payments</h2>
          <div className="space-y-2">
            {pendingPayments.data?.slice(0, 10).map((p) => {
              const t = p.tenant as unknown as { name: string } | null
              return (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.method.replace('_', ' ')} · {formatDate(p.created_at)}</p>
                  </div>
                  <p className="text-sm text-gray-600">{formatCurrency(p.amount)}</p>
                </div>
              )
            })}
            {(!pendingPayments.data || pendingPayments.data.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">Nothing pending</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
