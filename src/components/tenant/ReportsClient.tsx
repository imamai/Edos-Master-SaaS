'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  salesByDay: Array<{ date: string; total: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  paymentBreakdown: Record<string, number>
  tenantId: string
}

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const paymentLabels: Record<string, string> = {
  cash: 'Cash',
  mpesa: 'M-Pesa',
  card: 'Card',
  credit: 'Credit',
  split: 'Split',
}

export default function ReportsClient({ salesByDay, topProducts, paymentBreakdown }: Props) {
  const pieData = Object.entries(paymentBreakdown).map(([method, value]) => ({
    name: paymentLabels[method] || method,
    value,
  }))

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Daily sales line chart */}
      <div className="bg-white rounded-xl border p-5 lg:col-span-2">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Sales (This Month)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={salesByDay} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => new Date(v).getDate().toString()}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), 'Revenue']}
              labelFormatter={(l) => formatDate(l)}
            />
            <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Top Products (This Month)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topProducts.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="revenue" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment breakdown */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Payment Methods (This Month)</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
        )}
      </div>

      {/* Top products table */}
      <div className="bg-white rounded-xl border p-5 lg:col-span-2">
        <h2 className="font-semibold text-gray-900 mb-4">Product Performance</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left text-xs text-gray-500 font-medium">Product</th>
              <th className="py-2 text-right text-xs text-gray-500 font-medium">Qty Sold</th>
              <th className="py-2 text-right text-xs text-gray-500 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <tr key={p.name}>
                <td className="py-2 text-sm text-gray-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  {p.name}
                </td>
                <td className="py-2 text-sm text-right text-gray-600">{p.quantity}</td>
                <td className="py-2 text-sm text-right font-semibold">{formatCurrency(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
