'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Search, Plus, Edit2, Truck, Phone, Mail, X, Loader2 } from 'lucide-react'
import ExportMenu from '@/components/shared/ExportMenu'
import { useTenantId } from '@/lib/hooks/useTenantId'

interface Supplier {
  id: string; name: string; contact_person: string | null; phone: string | null
  email: string | null; address: string | null; tax_pin: string | null
  payment_terms: string | null; outstanding_balance: number; is_active: boolean
}

export default function SuppliersClient() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const loadSuppliers = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    let q = supabase.from('suppliers').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name')
    if (search.trim()) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    const { data } = await q.limit(100)
    setSuppliers(data as Supplier[] ?? [])
    setLoading(false)
  }, [tenantId, search])

  useEffect(() => { loadSuppliers() }, [loadSuppliers])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Suppliers</h1>
        <div className="flex items-center gap-2">
          <ExportMenu
            columns={[
              { header: 'Company Name', key: 'name', width: 24 },
              { header: 'Contact Person', key: 'contact_person', width: 20 },
              { header: 'Phone', key: 'phone', width: 16 },
              { header: 'Email', key: 'email', width: 24 },
              { header: 'KRA PIN', key: 'tax_pin', width: 14 },
              { header: 'Payment Terms', key: 'payment_terms', width: 16 },
              { header: 'Outstanding', key: 'outstanding_balance', width: 14 },
            ]}
            rows={suppliers as unknown as Record<string, unknown>[]}
            filename={`suppliers-${new Date().toISOString().slice(0, 10)}`}
            title="Supplier List"
          />
          <button onClick={() => { setEditSupplier(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Payment Terms</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Outstanding</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse dark:bg-slate-800" /></td></tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No suppliers found</p>
                </td></tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition dark:hover:bg-slate-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center dark:bg-blue-950">
                          <Truck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{s.name}</p>
                          {s.contact_person && <p className="text-xs text-slate-400 dark:text-slate-500">{s.contact_person}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs dark:text-slate-300">
                      {s.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                      {s.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm dark:text-slate-300">{s.payment_terms ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={(s.outstanding_balance ?? 0) > 0 ? 'text-red-600 font-semibold dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}>
                        {formatCurrency(s.outstanding_balance ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button onClick={() => { setEditSupplier(s); setShowForm(true) }}
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

      {showForm && tenantId && (
        <SupplierFormModal
          supplier={editSupplier}
          tenantId={tenantId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadSuppliers() }}
        />
      )}
    </div>
  )
}

function SupplierFormModal({ supplier, tenantId, onClose, onSaved }: {
  supplier: Supplier | null; tenantId: string; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: supplier?.name ?? '',
    contact_person: supplier?.contact_person ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    tax_pin: supplier?.tax_pin ?? '',
    payment_terms: supplier?.payment_terms ?? 'Net 30',
    address: supplier?.address ?? '',
  })

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, tenant_id: tenantId }
    let error
    if (supplier) {
      ;({ error } = await supabase.from('suppliers').update(payload).eq('id', supplier.id))
    } else {
      ;({ error } = await supabase.from('suppliers').insert(payload))
    }
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(supplier ? 'Supplier updated' : 'Supplier added')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white">{supplier ? 'Edit Supplier' : 'New Supplier'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 dark:text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {[
            { key: 'name', label: 'Company Name *', required: true },
            { key: 'contact_person', label: 'Contact Person' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'tax_pin', label: 'KRA PIN' },
            { key: 'payment_terms', label: 'Payment Terms' },
            { key: 'address', label: 'Address' },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">{label}</label>
              <input required={required} value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={ic} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm dark:bg-slate-800 dark:text-slate-200">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {supplier ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
