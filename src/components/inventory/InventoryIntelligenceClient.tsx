'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap, Clock, AlertOctagon, TrendingDown, Package,
  BarChart3, RefreshCw, ArrowUpRight, ShoppingBag, Search
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { useTenantId } from '@/lib/hooks/useTenantId'
import type { InventoryAgingItem } from '@/types'

type ClassFilter = 'all' | 'fast' | 'slow' | 'dead' | 'out_of_stock'
type AgeBucket  = '0-30' | '31-60' | '61-90' | '90+'

const AGE_COLORS: Record<AgeBucket, string> = {
  '0-30': '#22c55e',
  '31-60': '#f59e0b',
  '61-90': '#ef4444',
  '90+': '#7c3aed',
}

export default function InventoryIntelligenceClient() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const pathname = usePathname()
  const base = pathname.startsWith('/tenant') ? '/tenant' : ''

  const [items, setItems] = useState<InventoryAgingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [classFilter, setClassFilter] = useState<ClassFilter>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory_aging')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('days_since_last_sale', { ascending: false })
      .limit(500)
    if (error) console.error(error)
    setItems((data as InventoryAgingItem[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  // ── Derived stats ──────────────────────────────────────────
  const totalValue = items.reduce((s, i) => s + (i.stock_value ?? 0), 0)
  const fastItems = items.filter((i) => i.computed_classification === 'fast')
  const slowItems = items.filter((i) => i.computed_classification === 'slow')
  const deadItems = items.filter((i) => i.computed_classification === 'dead')
  const outItems  = items.filter((i) => i.computed_classification === 'out_of_stock')

  const deadValue = deadItems.reduce((s, i) => s + (i.stock_value ?? 0), 0)
  const fastValue = fastItems.reduce((s, i) => s + (i.stock_value ?? 0), 0)

  // Age bucket chart data
  const ageBucketCounts = (['0-30', '31-60', '61-90', '90+'] as AgeBucket[]).map((bucket) => ({
    bucket,
    count: items.filter((i) => i.age_bucket === bucket).length,
    value: items.filter((i) => i.age_bucket === bucket).reduce((s, i) => s + (i.stock_value ?? 0), 0),
  }))

  // Reorder suggestions: quantity <= low_stock_threshold AND still active
  const reorderNeeded = items.filter((i) =>
    i.quantity > 0 && i.quantity <= i.low_stock_threshold && i.computed_classification !== 'dead'
  ).sort((a, b) => a.quantity - b.quantity)

  // Filtered display list
  const displayed = items.filter((i) => {
    const matchClass = classFilter === 'all' || i.computed_classification === classFilter
    const matchSearch = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase())
    return matchClass && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Intelligence</h1>
          <p className="text-slate-500 text-sm mt-0.5 dark:text-slate-400">Stock aging, movement classification, and reorder analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${base}/inventory`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition dark:text-blue-400 dark:hover:bg-blue-950">
            <Package className="w-4 h-4" /> Inventory
          </Link>
          <button onClick={load} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition dark:text-slate-500 dark:hover:bg-slate-800" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Stock Value"
          value={formatCurrency(totalValue)}
          sub={`${items.length} active products`}
          icon={BarChart3}
          color="blue"
        />
        <KPICard
          label="Fast-Moving Items"
          value={fastItems.length.toString()}
          sub={formatCurrency(fastValue)}
          icon={Zap}
          color="green"
          onClick={() => setClassFilter(classFilter === 'fast' ? 'all' : 'fast')}
          active={classFilter === 'fast'}
        />
        <KPICard
          label="Slow-Moving Items"
          value={slowItems.length.toString()}
          sub={`${slowItems.length} items need attention`}
          icon={Clock}
          color="amber"
          onClick={() => setClassFilter(classFilter === 'slow' ? 'all' : 'slow')}
          active={classFilter === 'slow'}
        />
        <KPICard
          label="Dead Stock"
          value={deadItems.length.toString()}
          sub={`${formatCurrency(deadValue)} tied up`}
          icon={AlertOctagon}
          color="red"
          onClick={() => setClassFilter(classFilter === 'dead' ? 'all' : 'dead')}
          active={classFilter === 'dead'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aging chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 dark:text-white">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Inventory Aging by Age Bucket
          </h3>
          {loading ? (
            <div className="h-48 bg-slate-50 rounded-xl animate-pulse dark:bg-slate-800" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageBucketCounts} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'count' ? `${value} products` : formatCurrency(Number(value)),
                    name === 'count' ? 'Products' : 'Value',
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {ageBucketCounts.map((entry) => (
                    <Cell key={entry.bucket} fill={AGE_COLORS[entry.bucket]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-3">
            {ageBucketCounts.map(({ bucket, count, value }) => (
              <div key={bucket} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AGE_COLORS[bucket] }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">{bucket}d: {count} ({formatCurrency(value)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reorder suggestions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 dark:text-white">
              <ShoppingBag className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Reorder Suggestions
            </h3>
            {reorderNeeded.length > 0 && (
              <Link href={`${base}/procurement`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400">
                Create PO <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-800" />)}
            </div>
          ) : reorderNeeded.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8 dark:text-slate-500">Stock levels are healthy</p>
          ) : (
            <div className="space-y-1.5">
              {reorderNeeded.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700 truncate dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.supplier_name ?? 'No supplier'}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">{item.quantity} left</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Reorder: {item.reorder_quantity || item.low_stock_threshold}</p>
                  </div>
                </div>
              ))}
              {reorderNeeded.length > 8 && (
                <p className="text-xs text-center text-slate-400 pt-1 dark:text-slate-500">+{reorderNeeded.length - 8} more</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap dark:border-slate-800">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden dark:border-slate-700">
            {([
              { id: 'all', label: 'All' },
              { id: 'fast', label: '⚡ Fast' },
              { id: 'slow', label: '🐢 Slow' },
              { id: 'dead', label: '💀 Dead' },
              { id: 'out_of_stock', label: 'Out' },
            ] as const).map(({ id, label }) => (
              <button key={id} onClick={() => setClassFilter(id as ClassFilter)}
                className={`px-3 py-2 text-xs font-medium transition ${
                  classFilter === id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">Stock Value</th>
                <th className="text-right px-4 py-3">Days in Inv.</th>
                <th className="text-right px-4 py-3">Days Since Sale</th>
                <th className="text-right px-4 py-3">Total Sold</th>
                <th className="text-center px-4 py-3">Age Bucket</th>
                <th className="text-center px-4 py-3">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse dark:bg-slate-800" /></td>
                  ))}</tr>
                ))
              ) : displayed.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-slate-400 dark:text-slate-500">
                  <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No products match this filter</p>
                </td></tr>
              ) : (
                displayed.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition dark:hover:bg-slate-800">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                      {item.sku && <p className="text-xs text-slate-400 font-mono dark:text-slate-500">{item.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs dark:text-slate-300">{item.category_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs dark:text-slate-300">{item.supplier_name ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${item.quantity === 0 ? 'text-red-600 dark:text-red-400' : item.quantity <= item.low_stock_threshold ? 'text-amber-600 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatCurrency(item.stock_value)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs dark:text-slate-300">{item.days_in_inventory ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium ${
                        (item.days_since_last_sale ?? 0) > 90 ? 'text-purple-700 dark:text-purple-400' :
                        (item.days_since_last_sale ?? 0) > 60 ? 'text-red-600 dark:text-red-400' :
                        (item.days_since_last_sale ?? 0) > 30 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {item.days_since_last_sale != null ? `${item.days_since_last_sale}d` : 'Never'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-semibold dark:text-slate-200">{item.total_sold}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
                        style={{ backgroundColor: AGE_COLORS[item.age_bucket] + '20', color: AGE_COLORS[item.age_bucket] }}>
                        {item.age_bucket}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ClassBadge cls={item.computed_classification} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {displayed.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>Showing {displayed.length} of {items.length} products</span>
            <span>Total value: {formatCurrency(displayed.reduce((s, i) => s + (i.stock_value ?? 0), 0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ClassBadge({ cls }: { cls: string }) {
  const map: Record<string, { label: string; className: string }> = {
    fast:          { label: '⚡ Fast',      className: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
    normal:        { label: 'Normal',        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    slow:          { label: '🐢 Slow',      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    dead:          { label: '💀 Dead',      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    overstock:     { label: '📦 Overstock', className: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
    out_of_stock:  { label: 'Out of Stock', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  }
  const cfg = map[cls] ?? { label: cls, className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function KPICard({
  label, value, sub, icon: Icon, color, onClick, active,
}: {
  label: string; value: string; sub: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'amber' | 'red'
  onClick?: () => void
  active?: boolean
}) {
  const colorMap = {
    blue:  { bg: 'bg-blue-50 dark:bg-blue-950',   text: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-300' },
    green: { bg: 'bg-green-50 dark:bg-green-950',  text: 'text-green-600 dark:text-green-400',  ring: 'ring-green-300' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950',  text: 'text-amber-600 dark:text-amber-400',  ring: 'ring-amber-300' },
    red:   { bg: 'bg-red-50 dark:bg-red-950',    text: 'text-red-600 dark:text-red-400',    ring: 'ring-red-300' },
  }
  const c = colorMap[color]
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left w-full transition dark:bg-slate-900 dark:border-slate-800 ${
        onClick ? 'hover:shadow-md cursor-pointer' : ''
      } ${active ? `ring-2 ${c.ring}` : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} mb-3`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className={`text-sm font-medium mt-0.5 ${c.text}`}>{label}</p>
      <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">{sub}</p>
    </Wrapper>
  )
}
