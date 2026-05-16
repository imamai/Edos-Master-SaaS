'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category, Supplier } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().default('pcs'),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(10),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  description: z.string().optional(),
  track_inventory: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

interface Props {
  product: Product | null
  categories: Category[]
  suppliers: Supplier[]
  tenantId: string
  onSaved: (product: Product) => void
  onClose: () => void
}

export default function ProductModal({ product, categories, suppliers, tenantId, onSaved, onClose }: Props) {
  const supabase = createClient()
  const isEdit = !!product

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      unit: product?.unit || 'pcs',
      cost_price: product?.cost_price || 0,
      selling_price: product?.selling_price || 0,
      quantity: product?.quantity || 0,
      low_stock_threshold: product?.low_stock_threshold || 10,
      category_id: product?.category_id || '',
      supplier_id: product?.supplier_id || '',
      description: product?.description || '',
      track_inventory: product?.track_inventory ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      tenant_id: tenantId,
      category_id: data.category_id || null,
      supplier_id: data.supplier_id || null,
      sku: data.sku || null,
      barcode: data.barcode || null,
    }

    let result, error
    if (isEdit) {
      ;({ data: result, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select(`*, category:categories(name, color), supplier:suppliers(name)`)
        .single())
    } else {
      ;({ data: result, error } = await supabase
        .from('products')
        .insert(payload)
        .select(`*, category:categories(name, color), supplier:suppliers(name)`)
        .single())
    }

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(isEdit ? 'Product updated!' : 'Product added!')
    onSaved(result as Product)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input {...register('name')} className="input" placeholder="e.g. Unga Pembe 2kg" />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">SKU</label>
              <input {...register('sku')} className="input" placeholder="e.g. PRD001" />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input {...register('barcode')} className="input" placeholder="e.g. 5901234123457" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cost Price (KES)</label>
              <input {...register('cost_price')} type="number" min="0" step="0.01" className="input" />
              {errors.cost_price && <p className="error">{errors.cost_price.message}</p>}
            </div>
            <div>
              <label className="label">Selling Price (KES) *</label>
              <input {...register('selling_price')} type="number" min="0" step="0.01" className="input" />
              {errors.selling_price && <p className="error">{errors.selling_price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input {...register('quantity')} type="number" min="0" className="input" />
            </div>
            <div>
              <label className="label">Low Stock Alert</label>
              <input {...register('low_stock_threshold')} type="number" min="0" className="input" />
            </div>
            <div>
              <label className="label">Unit</label>
              <select {...register('unit')} className="input">
                {['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'pack', 'pair', 'set', 'roll'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select {...register('supplier_id')} className="input">
                <option value="">None</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="input resize-none" />
          </div>

          <div className="flex items-center gap-2">
            <input {...register('track_inventory')} type="checkbox" id="track" className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="track" className="text-sm text-gray-700">Track inventory for this product</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label { display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input { width: 100%; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
        .input:focus { ring: 2px; border-color: #2563EB; }
        .error { color: #DC2626; font-size: 0.75rem; margin-top: 0.25rem; }
      `}</style>
    </div>
  )
}
