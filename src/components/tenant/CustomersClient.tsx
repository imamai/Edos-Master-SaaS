'use client'

import { useState } from 'react'
import { Search, Plus, Phone, Mail, Star, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Customer } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  customers: Customer[]
  tenantId: string
}

export default function CustomersClient({ customers: initial, tenantId }: Props) {
  const [customers, setCustomers] = useState(initial)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.includes(search)
  )

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({ ...data, tenant_id: tenantId, email: data.email || null })
      .select()
      .single()

    if (error) { toast.error(error.message); return }
    toast.success('Customer added!')
    setCustomers([customer as Customer, ...customers])
    setShowModal(false)
    reset()
  }

  return (
    <>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Loyalty Points</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.phone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                  {c.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right">{formatCurrency(c.total_spent)}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {c.loyalty_points}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No customers found</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Add Customer</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0712345678" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                  <input {...register('city')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <input {...register('address')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset() }} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
