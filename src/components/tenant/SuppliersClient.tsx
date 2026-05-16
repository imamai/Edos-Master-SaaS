'use client'

import { useState } from 'react'
import { Plus, X, Loader2, Phone, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  suppliers: Supplier[]
  tenantId: string
}

export default function SuppliersClient({ suppliers: initial, tenantId }: Props) {
  const [suppliers, setSuppliers] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert({ ...data, tenant_id: tenantId, email: data.email || null })
      .select()
      .single()

    if (error) { toast.error(error.message); return }
    toast.success('Supplier added!')
    setSuppliers([supplier as Supplier, ...suppliers])
    setShowModal(false)
    reset()
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  {s.contact_name && <p className="text-xs text-gray-400">{s.contact_name}</p>}
                </td>
                <td className="px-4 py-3">
                  {s.phone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                  {s.email && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{[s.city, s.address].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-right">
                  <span className={s.balance > 0 ? 'text-red-600' : 'text-gray-900'}>
                    {formatCurrency(s.balance)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && <div className="text-center py-12 text-gray-400">No suppliers added</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Add Supplier</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
                  <input {...register('contact_name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...register('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset() }} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
