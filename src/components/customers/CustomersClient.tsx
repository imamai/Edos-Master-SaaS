'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Search, Plus, Edit2, User, Phone, Mail, X, Loader2, Star } from 'lucide-react'
import ExportMenu from '@/components/shared/ExportMenu'
import { useTenantId } from '@/lib/hooks/useTenantId'

interface Customer {
  id: string; name: string; phone: string | null; email: string | null
  address: string | null; id_number: string | null; kra_pin: string | null; credit_limit: number
  outstanding_balance: number; loyalty_points: number; notes: string | null; is_active: boolean
}

export default function CustomersClient() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<{ id: string; receipt_number: string; total_amount: number; payment_method: string; created_at: string }[]>([])

  const loadCustomers = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    let q = supabase.from('customers').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name')
    if (search.trim()) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q.limit(100)
    setCustomers(data as Customer[] ?? [])
    setLoading(false)
  }, [tenantId, search])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  async function loadCustomerSales(customerId: string) {
    const { data } = await supabase.from('sales')
      .select('id, receipt_number, total_amount, payment_method, created_at')
      .eq('customer_id', customerId).order('created_at', { ascending: false }).limit(20)
    setSales(data ?? [])
  }

  const totalCredit = customers.reduce((s, c) => s + (c.outstanding_balance ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5 dark:text-slate-400">{customers.length} active customers</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            columns={[
              { header: 'Name', key: 'name', width: 24 },
              { header: 'Phone', key: 'phone', width: 16 },
              { header: 'Email', key: 'email', width: 24 },
              { header: 'Address', key: 'address', width: 28 },
              { header: 'Credit Limit', key: 'credit_limit', width: 14 },
              { header: 'Outstanding', key: 'outstanding_balance', width: 18 },
              { header: 'Loyalty Pts', key: 'loyalty_points', width: 14 },
            ]}
            rows={customers as unknown as Record<string, unknown>[]}
            filename={`customers-${new Date().toISOString().slice(0, 10)}`}
            title="Customer List"
          />
          <button onClick={() => { setEditCustomer(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 dark:bg-slate-800 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Customers</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 dark:text-white">{customers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 dark:bg-slate-800 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding Credit</p>
          <p className="text-2xl font-bold text-red-600 mt-1 dark:text-red-400">{formatCurrency(totalCredit)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 dark:bg-slate-800 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">With Balance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1 dark:text-amber-400">{customers.filter((c) => (c.outstanding_balance ?? 0) > 0).length}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone, or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-800 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Contact</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Credit Limit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Outstanding</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Loyalty Pts</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse dark:bg-slate-700" /></td></tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No customers found</p>
                </td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition cursor-pointer dark:hover:bg-slate-700"
                    onClick={() => { setViewCustomer(c); loadCustomerSales(c.id) }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{c.name}</p>
                          {c.id_number && <p className="text-xs text-slate-400 dark:text-slate-500">{c.id_number}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs dark:text-slate-300">
                      {c.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                      {c.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatCurrency(c.credit_limit ?? 0)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={(c.outstanding_balance ?? 0) > 0 ? 'text-red-600 font-semibold dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {formatCurrency(c.outstanding_balance ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-amber-600 dark:text-amber-400">
                        <Star className="w-3 h-3" />{c.loyalty_points}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); setEditCustomer(c); setShowForm(true) }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition dark:text-slate-500 dark:hover:text-blue-400 dark:hover:bg-blue-950">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto dark:bg-slate-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white">{viewCustomer.name}</h3>
              <button onClick={() => setViewCustomer(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {viewCustomer.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />{viewCustomer.phone}</div>
                )}
                {viewCustomer.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />{viewCustomer.email}</div>
                )}
                {viewCustomer.kra_pin && (
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 col-span-2">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">KRA PIN</span> {viewCustomer.kra_pin}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Credit Limit</p>
                  <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(viewCustomer.credit_limit ?? 0)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center dark:bg-red-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding</p>
                  <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(viewCustomer.outstanding_balance ?? 0)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center dark:bg-amber-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loyalty Pts</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">{viewCustomer.loyalty_points}</p>
                </div>
              </div>
              <h4 className="font-semibold text-slate-700 text-sm dark:text-slate-200">Purchase History</h4>
              <div className="space-y-2">
                {sales.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4 dark:text-slate-500">No purchases yet</p>
                ) : (
                  sales.map((s) => (
                    <div key={s.id} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.receipt_number}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(s.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(s.total_amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.payment_method === 'credit' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'}`}>
                          {s.payment_method}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && tenantId && (
        <CustomerFormModal
          customer={editCustomer}
          tenantId={tenantId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadCustomers() }}
        />
      )}
    </div>
  )
}

function CustomerFormModal({ customer, tenantId, onClose, onSaved }: {
  customer: Customer | null; tenantId: string; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
    id_number: customer?.id_number ?? '',
    kra_pin: customer?.kra_pin ?? '',
    credit_limit: customer?.credit_limit ?? 0,
    notes: customer?.notes ?? '',
  })

  const ic = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, credit_limit: Number(form.credit_limit), tenant_id: tenantId }
    let error
    if (customer) {
      ;({ error } = await supabase.from('customers').update(payload).eq('id', customer.id))
    } else {
      ;({ error } = await supabase.from('customers').insert(payload))
    }
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(customer ? 'Customer updated' : 'Customer created')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">{customer ? 'Edit Customer' : 'New Customer'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-400 dark:text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Full Name *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={ic} placeholder="+254..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">ID Number</label>
              <input value={form.id_number} onChange={(e) => setForm((f) => ({ ...f, id_number: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">KRA PIN</label>
              <input value={form.kra_pin} onChange={(e) => setForm((f) => ({ ...f, kra_pin: e.target.value.toUpperCase() }))}
                placeholder="e.g. A012345678Z" className={ic} />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Optional — needed if this customer wants to claim input VAT on invoices.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Credit Limit (KES)</label>
              <input type="number" min={0} value={form.credit_limit} onChange={(e) => setForm((f) => ({ ...f, credit_limit: Number(e.target.value) }))} className={ic} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Address</label>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={ic} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm dark:bg-slate-800 dark:text-slate-200">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {customer ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
