import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AnalyticsPage() {
  const supabase = await createServiceClient()

  const now = new Date()
  const last30 = new Date(now)
  last30.setDate(last30.getDate() - 30)

  const [tenantsByMonth, subscriptions, invoices] = await Promise.all([
    supabase
      .from('tenants')
      .select('created_at, status')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),
    supabase
      .from('subscriptions')
      .select('amount, status, billing_cycle, created_at')
      .eq('status', 'active'),
    supabase
      .from('invoices')
      .select('amount, status, created_at')
      .gte('created_at', last30.toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const subs = subscriptions.data || []
  const mrr = subs.reduce((sum, s) => {
    if (s.billing_cycle === 'yearly') return sum + s.amount / 12
    if (s.billing_cycle === 'semiannual') return sum + s.amount / 6
    return sum + s.amount
  }, 0)

  const arr = mrr * 12
  const avgRevPerTenant = subs.length > 0 ? mrr / subs.length : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Platform revenue and growth metrics</p>
      </div>

      {/* Key metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'MRR', value: formatCurrency(mrr), sub: 'Monthly Recurring Revenue' },
          { label: 'ARR', value: formatCurrency(arr), sub: 'Annual Run Rate' },
          { label: 'Active Subs', value: subs.length, sub: 'Paying tenants' },
          { label: 'Avg Revenue', value: formatCurrency(avgRevPerTenant), sub: 'Per tenant/month' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border p-5">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Billing breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Billing Cycle</h2>
          <div className="space-y-3">
            {(['monthly', 'semiannual', 'yearly'] as const).map((cycle) => {
              const cycleSubs = subs.filter(s => s.billing_cycle === cycle)
              const revenue = cycleSubs.reduce((sum, s) => sum + s.amount, 0)
              const pct = subs.length > 0 ? (cycleSubs.length / subs.length) * 100 : 0
              return (
                <div key={cycle}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{cycle}</span>
                    <span className="font-medium">{formatCurrency(revenue)} ({cycleSubs.length} tenants)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Invoices (30 days)</h2>
          <div className="space-y-2">
            {invoices.data?.slice(0, 10).map((inv) => (
              <div key={inv.created_at} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(inv.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                  inv.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
