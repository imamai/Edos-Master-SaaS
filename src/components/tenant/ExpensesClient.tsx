'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense } from '@/types'

const schema = z.object({
  category: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  amount: z.coerce.number().positive('Must be positive'),
  payment_method: z.string().default('cash'),
  date: z.string().default(() => new Date().toISOString().split('T')[0]),
})
type FormData = z.infer<typeof schema>

interface Props {
  expenses: Expense[]
  categories: string[]
  tenantId: string
}

export default function ExpensesClient({ expenses: initial, categories, tenantId }: Props) {
  const [expenses, setExpenses] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0], payment_method: 'cash' },
  })

  const onSubmit = async (data: FormData) => {
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()

    if (error) { toast.error(error.message); return }
    toast.success('Expense recorded!')
    setExpenses([expense as Expense, ...expenses])
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
          <Plus className="w-4 h-4" /> Record Expense
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(e.date)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{e.category}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{e.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{e.payment_method}</td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-red-600">{formatCurrency(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div className="text-center py-12 text-gray-400">No expenses recorded</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Record Expense</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select {...register('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                <input {...register('description')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount (KES) *</label>
                  <input {...register('amount')} type="number" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                  <select {...register('payment_method')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input {...register('date')} type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset() }} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
