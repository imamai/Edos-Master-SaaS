'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { X, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react'

interface Product {
  id: string; name: string; sku: string | null; unit: string; stock_quantity: number
}

interface Props {
  product: Product
  branchId?: string | null
  tenantId: string
  onClose: () => void
  onSaved: () => void
}

export default function StockAdjustModal({ product, branchId, tenantId, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [type, setType] = useState<'in' | 'out' | 'adjust'>('in')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const currentStock = product.stock_quantity ?? 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const bid = branchId ?? (await db.from('branches').select('id').eq('tenant_id', tenantId).eq('is_main', true).single()).data?.id

    const { data: inventoryRow } = await db
      .from('inventory').select('*').eq('product_id', product.id).eq('branch_id', bid).single()

    const currentQty = (inventoryRow as { quantity?: number } | null)?.quantity ?? 0
    let newQty: number
    if (type === 'adjust') newQty = quantity
    else if (type === 'in') newQty = currentQty + quantity
    else newQty = Math.max(0, currentQty - quantity)

    const { error: invError } = await db.from('inventory').upsert(
      { tenant_id: tenantId, product_id: product.id, branch_id: bid, quantity: newQty, last_updated: new Date().toISOString() },
      { onConflict: 'product_id,branch_id' }
    )

    if (!invError && user) {
      await db.from('stock_movements').insert({
        tenant_id: tenantId, product_id: product.id, branch_id: bid,
        type: type === 'in' ? 'purchase' : type === 'out' ? 'damage' : 'adjustment',
        quantity: type === 'adjust' ? newQty - currentQty : (type === 'in' ? quantity : -quantity),
        notes, created_by: user.id,
      })
    }
    setLoading(false)
    if (invError) { toast.error(invError.message); return }
    toast.success('Stock updated successfully')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Adjust Stock</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="font-semibold text-slate-800">{product.name}</p>
            <p className="text-sm text-slate-500">{product.sku}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">Current Stock:</span>
              <span className="font-bold text-lg text-blue-600">{currentStock} {product.unit}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: 'in', label: 'Stock In', icon: ArrowUpCircle, color: 'green' },
              { v: 'out', label: 'Stock Out', icon: ArrowDownCircle, color: 'red' },
              { v: 'adjust', label: 'Set Qty', icon: null, color: 'blue' },
            ] as const).map(({ v, label, icon: Icon, color }) => (
              <button key={v} type="button" onClick={() => setType(v)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition ${
                  type === v
                    ? color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                      : color === 'red' ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                {Icon && <Icon className="w-5 h-5" />}
                {label}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {type === 'adjust' ? 'New Quantity' : 'Quantity'} ({product.unit})
            </label>
            <input type="number" min={0} step={0.01} required value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {type !== 'adjust' && (
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">New stock will be</p>
              <p className="text-xl font-bold text-slate-800">
                {type === 'in' ? currentStock + quantity : Math.max(0, currentStock - quantity)} {product.unit}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stock received from supplier"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
