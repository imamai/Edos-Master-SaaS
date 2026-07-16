'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateOnly } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import { Calendar } from 'lucide-react'
import ExportMenu from '@/components/shared/ExportMenu'
import { useTenantId } from '@/lib/hooks/useTenantId'

type Period = 'today' | 'week' | 'month' | 'custom'
type Tab = 'sales' | 'products' | 'payments' | 'expenses' | 'credit'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

interface SaleSummary {
  date: string; revenue: number; transactions: number
  cash: number; mpesa: number; credit: number; card: number
  grossProfit: number; expenses: number; netProfit: number
}

export default function ReportsClient() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [period, setPeriod] = useState<Period>('month')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab] = useState<Tab>('sales')
  const [salesData, setSalesData] = useState<SaleSummary[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number; qty: number; category: string; cost: number; profit: number; margin: number }[]>([])
  const [paymentMix, setPaymentMix] = useState<{ name: string; value: number; count: number }[]>([])
  const [expensesBreakdown, setExpensesBreakdown] = useState<{ category: string; amount: number; count: number }[]>([])
  const [creditCustomers, setCreditCustomers] = useState<{ name: string; outstanding_balance: number; credit_limit: number }[]>([])
  const [loading, setLoading] = useState(false)

  function updateDates(p: Period) {
    const now = new Date()
    if (p === 'today') {
      const t = now.toISOString().split('T')[0]
      setStartDate(t); setEndDate(t)
    } else if (p === 'week') {
      const w = new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0]
      setStartDate(w); setEndDate(now.toISOString().split('T')[0])
    } else if (p === 'month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    }
  }

  const loadReport = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const from = `${startDate}T00:00:00`
    const to = `${endDate}T23:59:59`

    if (tab === 'sales') {
      const [salesRes, expRes] = await Promise.all([
        supabase.from('sales')
          .select('total_amount, tax_amount, payment_method, created_at, sale_items(quantity, products(cost_price))')
          .eq('tenant_id', tenantId).eq('status', 'completed')
          .gte('created_at', from).lte('created_at', to).order('created_at'),
        supabase.from('expenses')
          .select('amount, expense_date')
          .eq('tenant_id', tenantId)
          .gte('expense_date', startDate).lte('expense_date', endDate),
      ])

      // Build expense map by date
      const expMap = new Map<string, number>()
      ;(expRes.data as { amount: number; expense_date: string }[] ?? []).forEach((e) => {
        expMap.set(e.expense_date, (expMap.get(e.expense_date) ?? 0) + e.amount)
      })

      // Aggregate sales by date
      const byDate = new Map<string, SaleSummary>()
      ;(salesRes.data as { created_at: string; total_amount: number; tax_amount: number; payment_method: string; sale_items: { quantity: number; products: { cost_price: number } | null }[] }[] ?? []).forEach((s) => {
        const d = s.created_at.split('T')[0]
        if (!byDate.has(d)) byDate.set(d, { date: d, revenue: 0, transactions: 0, cash: 0, mpesa: 0, credit: 0, card: 0, grossProfit: 0, expenses: 0, netProfit: 0 })
        const entry = byDate.get(d)!
        const cogs = (s.sale_items ?? []).reduce((sum, item) => sum + (item.products?.cost_price ?? 0) * Number(item.quantity), 0)
        entry.revenue += s.total_amount
        entry.transactions += 1
        entry.grossProfit += (s.total_amount - s.tax_amount) - cogs
        if (s.payment_method === 'cash') entry.cash += s.total_amount
        if (s.payment_method === 'mpesa') entry.mpesa += s.total_amount
        if (s.payment_method === 'credit') entry.credit += s.total_amount
        if (s.payment_method === 'card') entry.card += s.total_amount
      })

      // Add expense-only days (no sales that day)
      expMap.forEach((amount, date) => {
        if (!byDate.has(date)) {
          byDate.set(date, { date, revenue: 0, transactions: 0, cash: 0, mpesa: 0, credit: 0, card: 0, grossProfit: 0, expenses: 0, netProfit: 0 })
        }
      })

      // Merge expenses into each day and compute net profit
      const merged = [...byDate.values()]
        .map(d => {
          const exp = expMap.get(d.date) ?? 0
          return { ...d, expenses: exp, netProfit: d.grossProfit - exp }
        })
        .sort((a, b) => a.date.localeCompare(b.date))

      setSalesData(merged)
    }

    if (tab === 'products') {
      const { data } = await supabase.from('sales')
        .select('sale_items(quantity, total_price, products(name, cost_price, categories(name)))')
        .eq('tenant_id', tenantId).eq('status', 'completed')
        .gte('created_at', from).lte('created_at', to)
      const map = new Map<string, { name: string; revenue: number; qty: number; category: string; cost: number; profit: number }>()
      ;(data as { sale_items: { quantity: number; total_price: number; products: { name: string; cost_price: number; categories: { name: string } | null } | null }[] }[] ?? []).forEach((sale) => {
        const items = sale.sale_items ?? []
        items.forEach((item) => {
          const prod = item.products
          const key = prod?.name ?? 'Unknown'
          if (!map.has(key)) map.set(key, { name: key, revenue: 0, qty: 0, category: prod?.categories?.name ?? '', cost: 0, profit: 0 })
          const e = map.get(key)!
          const itemCost = (prod?.cost_price ?? 0) * Number(item.quantity)
          e.revenue += item.total_price
          e.qty += Number(item.quantity)
          e.cost += itemCost
          e.profit += item.total_price - itemCost
        })
      })
      setTopProducts([...map.values()].map(p => ({
        ...p,
        margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0,
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 15))
    }

    if (tab === 'payments') {
      const { data } = await supabase.from('sales')
        .select('payment_method, total_amount')
        .eq('tenant_id', tenantId).eq('status', 'completed')
        .gte('created_at', from).lte('created_at', to)
      const map = new Map<string, { name: string; value: number; count: number }>()
      ;(data as { payment_method: string; total_amount: number }[] ?? []).forEach((s) => {
        if (!map.has(s.payment_method)) map.set(s.payment_method, { name: s.payment_method.toUpperCase(), value: 0, count: 0 })
        const e = map.get(s.payment_method)!; e.value += s.total_amount; e.count += 1
      })
      setPaymentMix([...map.values()])
    }

    if (tab === 'expenses') {
      const { data } = await supabase.from('expenses')
        .select('amount, category')
        .eq('tenant_id', tenantId)
        .gte('expense_date', startDate).lte('expense_date', endDate)
      const map = new Map<string, { category: string; amount: number; count: number }>()
      ;(data as { amount: number; category: string | null }[] ?? []).forEach((e) => {
        const key = e.category ?? 'Uncategorized'
        if (!map.has(key)) map.set(key, { category: key, amount: 0, count: 0 })
        const entry = map.get(key)!
        entry.amount += e.amount
        entry.count += 1
      })
      setExpensesBreakdown([...map.values()].sort((a, b) => b.amount - a.amount))
    }

    if (tab === 'credit') {
      const { data } = await supabase.from('customers')
        .select('name, outstanding_balance, credit_limit')
        .eq('tenant_id', tenantId).gt('outstanding_balance', 0).eq('is_active', true)
        .order('outstanding_balance', { ascending: false }).limit(50)
      setCreditCustomers(data ?? [])
    }
    setLoading(false)
  }, [tenantId, tab, startDate, endDate])

  useEffect(() => { loadReport() }, [loadReport])

  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0)
  const totalTransactions = salesData.reduce((s, d) => s + d.transactions, 0)
  const totalGrossProfit = salesData.reduce((s, d) => s + d.grossProfit, 0)
  const totalExpenses = salesData.reduce((s, d) => s + d.expenses, 0)
  const totalNetProfit = salesData.reduce((s, d) => s + d.netProfit, 0)
  const netMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0
  const totalExpensesBreakdown = expensesBreakdown.reduce((s, e) => s + e.amount, 0)
  const totalCredit = creditCustomers.reduce((s, c) => s + c.outstanding_balance, 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sales', label: 'Sales' },
    { key: 'products', label: 'Products' },
    { key: 'payments', label: 'Payments' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'credit', label: 'Credit Aging' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
        <ExportMenu
          columns={
            tab === 'sales' ? [
              { header: 'Date', key: 'date', width: 14 },
              { header: 'Revenue', key: 'revenue', width: 14 },
              { header: 'Transactions', key: 'transactions', width: 14 },
              { header: 'Cash', key: 'cash', width: 12 },
              { header: 'M-Pesa', key: 'mpesa', width: 12 },
              { header: 'Credit', key: 'credit', width: 12 },
              { header: 'Gross Profit', key: 'grossProfit', width: 14 },
              { header: 'Expenses', key: 'expenses', width: 14 },
              { header: 'Net Profit', key: 'netProfit', width: 14 },
            ] : tab === 'products' ? [
              { header: 'Product', key: 'name', width: 28 },
              { header: 'Category', key: 'category', width: 18 },
              { header: 'Qty Sold', key: 'qty', width: 12 },
              { header: 'Revenue', key: 'revenue', width: 14 },
              { header: 'Cost', key: 'cost', width: 14 },
              { header: 'Profit', key: 'profit', width: 14 },
              { header: 'Margin %', key: 'margin', width: 12 },
            ] : tab === 'payments' ? [
              { header: 'Method', key: 'name', width: 16 },
              { header: 'Amount', key: 'value', width: 14 },
              { header: 'Count', key: 'count', width: 10 },
            ] : tab === 'expenses' ? [
              { header: 'Category', key: 'category', width: 24 },
              { header: 'Amount', key: 'amount', width: 14 },
              { header: 'Count', key: 'count', width: 10 },
            ] : [
              { header: 'Customer', key: 'name', width: 24 },
              { header: 'Outstanding', key: 'outstanding_balance', width: 14 },
              { header: 'Credit Limit', key: 'credit_limit', width: 14 },
            ]
          }
          rows={(
            tab === 'sales' ? salesData :
            tab === 'products' ? topProducts :
            tab === 'payments' ? paymentMix :
            tab === 'expenses' ? expensesBreakdown :
            creditCustomers
          ) as unknown as Record<string, unknown>[]}
          filename={`report-${tab}-${startDate}-${endDate}`}
          title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Report (${startDate} to ${endDate})`}
        />
      </div>

      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['today', 'week', 'month', 'custom'] as Period[]).map((p) => (
            <button key={p} onClick={() => { setPeriod(p); updateDates(p) }}
              className={`px-4 py-2 text-sm font-medium capitalize transition ${period === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              {p}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400 dark:text-slate-500">—</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="blue" />
            <SummaryCard label="Transactions" value={totalTransactions.toString()} color="slate" />
            <SummaryCard label="Gross Profit" value={formatCurrency(totalGrossProfit)} color="green" />
            <SummaryCard label="Total Expenses" value={formatCurrency(totalExpenses)} color="rose" />
            <SummaryCard label="Net Profit" value={formatCurrency(totalNetProfit)} color={totalNetProfit >= 0 ? 'emerald' : 'red'} />
            <SummaryCard label="Net Margin" value={`${netMargin.toFixed(1)}%`} color="amber" />
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Daily Revenue, Gross Profit & Net Profit</h3>
            {loading ? <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="grossProfit" fill="#10B981" radius={[4, 4, 0, 0]} name="Gross Profit" />
                  <Bar dataKey="netProfit" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  {['Date', 'Revenue', 'Txns', 'Cash', 'M-Pesa', 'Credit', 'Gross Profit', 'Expenses', 'Net Profit', 'Margin'].map((h) => (
                    <th key={h} className={`${h === 'Date' ? 'text-left' : 'text-right'} px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesData.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">{formatDateOnly(d.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(d.revenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{d.transactions}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(d.cash)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(d.mpesa)}</td>
                    <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">{formatCurrency(d.credit)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${d.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(d.grossProfit)}</td>
                    <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{d.expenses > 0 ? formatCurrency(d.expenses) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${d.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(d.netProfit)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">{d.revenue > 0 ? `${((d.netProfit / d.revenue) * 100).toFixed(1)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
              {salesData.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold">
                    <td className="px-4 py-3 text-slate-800 dark:text-white">TOTAL</td>
                    <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">{formatCurrency(totalRevenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-800 dark:text-white">{totalTransactions}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(salesData.reduce((s, d) => s + d.cash, 0))}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(salesData.reduce((s, d) => s + d.mpesa, 0))}</td>
                    <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">{formatCurrency(salesData.reduce((s, d) => s + d.credit, 0))}</td>
                    <td className={`px-4 py-3 text-right ${totalGrossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(totalGrossProfit)}</td>
                    <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(totalExpenses)}</td>
                    <td className={`px-4 py-3 text-right ${totalNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(totalNetProfit)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">{netMargin.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Products by Revenue</h3>
            {loading ? <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-10" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Revenue" />
                  <Bar dataKey="profit" fill="#10B981" radius={[0, 4, 4, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Qty Sold</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Profit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{p.category}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{p.qty}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(p.revenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">{formatCurrency(p.cost)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${p.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(p.profit)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.margin >= 20 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : p.margin >= 10 ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'}`}>
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Payment Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={paymentMix} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {paymentMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Payment Summary</h3>
            <div className="space-y-3">
              {paymentMix.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{formatCurrency(p.value)}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{p.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SummaryCard label="Total Expenses" value={formatCurrency(totalExpensesBreakdown)} color="rose" />
            <SummaryCard label="Categories" value={expensesBreakdown.length.toString()} color="slate" />
            <SummaryCard label="Entries" value={expensesBreakdown.reduce((s, e) => s + e.count, 0).toString()} color="amber" />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Expenses by Category</h3>
            {loading ? <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> : expensesBreakdown.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-12">No expenses recorded in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={expensesBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" fill="#F43F5E" radius={[0, 4, 4, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Entries</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expensesBreakdown.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{e.category}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{e.count}</td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">
                      {totalExpensesBreakdown > 0 ? `${((e.amount / totalExpensesBreakdown) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {expensesBreakdown.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold">
                    <td className="px-4 py-3 text-slate-800 dark:text-white">TOTAL</td>
                    <td className="px-4 py-3 text-right text-slate-800 dark:text-white">{expensesBreakdown.reduce((s, e) => s + e.count, 0)}</td>
                    <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{formatCurrency(totalExpensesBreakdown)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {tab === 'credit' && (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalCredit)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Customers with Balance</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{creditCustomers.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Outstanding</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Credit Limit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {creditCustomers.map((c, i) => {
                  const util = c.credit_limit > 0 ? (c.outstanding_balance / c.credit_limit) * 100 : 100
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(c.outstanding_balance)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(c.credit_limit)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${util > 90 ? 'bg-red-500' : util > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(100, util)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${util > 90 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>{util.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }: {
  label: string; value: string
  color: 'blue' | 'green' | 'slate' | 'purple' | 'emerald' | 'amber' | 'rose' | 'red'
}) {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
    slate: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950',
  }
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
