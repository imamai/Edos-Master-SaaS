'use client'

import { useState } from 'react'
import { X, Tag } from 'lucide-react'

interface Props {
  onAdd: (item: { name: string; unit_price: number; quantity: number; vat_rate?: number }) => void
  onClose: () => void
}

export default function CustomItemModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [taxable, setTaxable] = useState(true)

  const valid = name.trim().length > 0 && price > 0 && quantity > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onAdd({ name: name.trim(), unit_price: price, quantity, vat_rate: taxable ? 16 : 0 })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Add Custom Item</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-400 dark:text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">For a commodity that isn&apos;t in your product catalog — enter a name and price for this sale only.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Item Name *</label>
            <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Custom order"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Price (KES) *</label>
              <input required type="number" min={0.01} step={0.01} value={price || ''} onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Quantity *</label>
              <input required type="number" min={1} step={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-slate-700 dark:text-slate-200">Apply VAT (16%)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={!valid} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-medium transition">Add to Cart</button>
          </div>
        </form>
      </div>
    </div>
  )
}
