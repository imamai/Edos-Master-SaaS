import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Building2, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

async function getAdminStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [tenants, recentTenants, subscriptions] = await Promise.all([
    supabase.from('tenants').select('id, status, created_at'),
    supabase.from('tenants').select('id, name, subdomain, status, plan_id, created_at, plan:plans(name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('subscriptions').select('amount, status, created_at'),
  ])

  const all = tenants.data || []
  const subs = subscriptions.data || []
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalRevenue = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)
  const monthlyRevenue = subs.filter(s => s.status === 'active' && new Date(s.created_at) >= monthStart).reduce((sum, s) => sum + s.amount, 0)

  return {
    total: all.length,
    active: all.filter(t => t.status === 'active').length,
    trial: all.filter(t => t.status === 'trial').length,
    suspended: all.filter(t => t.status === 'suspended').length,
    grace: all.filter(t => t.status === 'grace_period').length,
    totalRevenue,
    monthlyRevenue,
    newThisMonth: all.filter(t => new Date(t.created_at) >= monthStart).length,
    recent: recentTenants.data || [],
  }
}

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle, className: 'text-green-600 bg-green-50' },
  trial: { label: 'Trial', icon: Clock, className: 'text-blue-600 bg-blue-50' },
  grace_period: { label: 'Grace', icon: AlertTriangle, className: 'text-amber-600 bg-amber-50' },
  suspended: { label: 'Suspended', icon: XCircle, className: 'text-red-600 bg-red-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-gray-600 bg-gray-50' },
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const stats = await getAdminStats(supabase)

  const statCards = [
    { title: 'Total Tenants', value: stats.total, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Free Trials', value: stats.trial, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of all tenants and platform health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.title}</span>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tenant Status</h2>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = status === 'active' ? stats.active
                : status === 'trial' ? stats.trial
                : status === 'grace_period' ? stats.grace
                : status === 'suspended' ? stats.suspended
                : 0
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                      <config.icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tenants</h2>
            <a href="/tenants" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {stats.recent.map((tenant: { id: string; name: string; subdomain: string; status: string; created_at: string; plan?: { name: string } | null }) => {
              const cfg = statusConfig[tenant.status as keyof typeof statusConfig]
              return (
                <div key={tenant.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{tenant.name}</p>
                    <p className="text-xs text-gray-400">{tenant.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(tenant.created_at)}</span>
                    {cfg && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
