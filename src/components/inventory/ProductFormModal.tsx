'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateSKU } from '@/lib/utils'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'

interface Category { id: string; name: string }
interface Product {
  id: string; name: string; sku: string | null; barcode: string | null
  category_id: string | null; unit: string; cost_price: number
  selling_price: number; vat_rate: number; reorder_level: number
  description: string | null; has_serial?: boolean; has_warranty?: boolean; warranty_months?: number
}

interface Props {
  product: Product | null
  categories: Category[]
  tenantId: string
  branchId?: string | null
  onClose: () => void
  onSaved: () => void
}

const ic = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function ProductFormModal({ product, categories, tenantId, branchId, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    unit: product?.unit ?? 'piece',
    cost_price: product?.cost_price ?? 0,
    selling_price: product?.selling_price ?? 0,
    vat_rate: product?.vat_rate ?? 16,
    reorder_level: product?.reorder_level ?? 5,
    has_serial: product?.has_serial ?? false,
    has_warranty: product?.has_warranty ?? false,
    warranty_months: product?.warranty_months ?? 12,
  })

  useEffect(() => {
    if (!product && form.category_id && form.name) {
      const catName = categories.find((c) => c.id === form.category_id)?.name ?? 'GEN'
      setForm((f) => ({ ...f, sku: generateSKU(catName, form.name) }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.category_id, form.name])

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const payload = {
      ...form,
      tenant_id: tenantId,
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      vat_rate: Number(form.vat_rate),
      reorder_level: Number(form.reorder_level),
      warranty_months: form.has_warranty ? Number(form.warranty_months) : null,
    }

    let error
    if (product) {
      ;({ error } = await db.from('products').update(payload).eq('id', product.id))
    } else {
      const { data: newProd, error: insertErr } = await db.from('products').insert(payload).select().single()
      error = insertErr
      if (!insertErr && newProd) {
        const bid = branchId ?? (await db.from('branches').select('id').eq('tenant_id', tenantId).eq('is_main', true).single()).data?.id
        if (bid) {
          await db.from('inventory').insert({ tenant_id: tenantId, product_id: newProd.id, branch_id: bid, quantity: 0 })
        }
      }
    }
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(product ? 'Product updated' : 'Product created')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name *">
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={ic} placeholder="e.g. Product Name" />
            </Field>
            <Field label="Category *">
              <select required value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className={ic}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="SKU *">
              <input required value={form.sku} onChange={(e) => update('sku', e.target.value)} className={ic} placeholder="e.g. CAT-PROD-001" />
            </Field>
            <Field label="Barcode">
              <input value={form.barcode} onChange={(e) => update('barcode', e.target.value)} className={ic} placeholder="Scan or enter barcode" />
            </Field>
            <Field label="Unit">
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className={ic}>
                {['piece', 'meter', 'roll', 'box', 'kg', 'liter', 'set', 'pair', 'carton'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field label="Reorder Level">
              <input type="number" min={0} value={form.reorder_level} onChange={(e) => update('reorder_level', e.target.value)} className={ic} />
            </Field>
            <Field label="Buying Price (KES) *">
              <input required type="number" min={0} step={0.01} value={form.cost_price} onChange={(e) => update('cost_price', e.target.value)} className={ic} />
            </Field>
            <Field label="Selling Price (KES) *">
              <input required type="number" min={0} step={0.01} value={form.selling_price} onChange={(e) => update('selling_price', e.target.value)} className={ic} />
            </Field>
            <Field label="VAT Rate (%)">
              <input type="number" min={0} max={100} value={form.vat_rate} onChange={(e) => update('vat_rate', e.target.value)} className={ic} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} rows={2} className={ic} placeholder="Optional product description" />
          </Field>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_serial} onChange={(e) => update('has_serial', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-slate-700">Track Serial Numbers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_warranty} onChange={(e) => update('has_warranty', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-slate-700">Has Warranty</span>
            </label>
          </div>
          {form.has_warranty && (
            <Field label="Warranty Period (months)">
              <input type="number" min={1} value={form.warranty_months} onChange={(e) => update('warranty_months', e.target.value)} className={ic} />
            </Field>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
