'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { CartCustomer } from '@/store/cart'
import { Search, X, User } from 'lucide-react'

interface Props {
  tenantId: string
  onSelect: (customer: CartCustomer) => void
  onClose: () => void
}

export default function CustomerSearchModal({ tenantId, onSelect, onClose }: Props) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<CartCustomer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { search() }, [query])

  async function search() {
    setLoading(true)
    let q = supabase
      .from('customers')
      .select('id, name, phone, email, credit_limit, outstanding_balance, loyalty_points')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .limit(20)
    if (query.trim()) {
      q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    }
    const { data } = await q.order('name')
    setCustomers((data ?? []) as CartCustomer[])
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Select Customer</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400 text-sm">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-slate-400">
              <User className="w-8 h-8" />
              <p className="text-sm">No customers found</p>
            </div>
          ) : (
            customers.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-slate-50 transition text-left"
              >
                <div>
                  <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.phone ?? 'No phone'}</p>
                </div>
                <div className="text-right">
                  {c.outstanding_balance > 0 && (
                    <p className="text-xs text-red-500 font-medium">Owes {formatCurrency(c.outstanding_balance)}</p>
                  )}
                  <p className="text-xs text-slate-400">{c.loyalty_points} pts</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
