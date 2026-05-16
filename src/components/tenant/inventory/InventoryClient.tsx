'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Package, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product, Category, Supplier } from '@/types'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  tenantId: string
}

export default function InventoryClient({ products: initial, categories, suppliers, tenantId }: Props) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search) || p.barcode?.includes(search)
    const matchesCat = !selectedCategory || p.category_id === selectedCategory
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'low' ? (p.quantity <= p.low_stock_threshold && p.quantity > 0 && p.track_inventory) :
      (p.quantity === 0 && p.track_inventory)
    return matchesSearch && matchesCat && matchesFilter
  })

  const handleSaved = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      return exists ? prev.map((p) => p.id === product.id ? product : p) : [product, ...prev]
    })
    setShowModal(false)
    setEditingProduct(null)
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, barcode..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU/Barcode</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((product) => {
              const isLow = product.track_inventory && product.quantity > 0 && product.quantity <= product.low_stock_threshold
              const isOut = product.track_inventory && product.quantity === 0
              const catColor = (product.category as { color?: string } | null)?.color
              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">
                    {product.sku && <p>{product.sku}</p>}
                    {product.barcode && <p className="text-gray-400">{product.barcode}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {(product.category as { name?: string } | null)?.name && (
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: catColor || '#6B7280' }}
                      >
                        {(product.category as { name: string } | null)?.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{formatCurrency(product.cost_price)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(product.selling_price)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                      {product.track_inventory ? product.quantity : '∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isOut && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> Out
                      </span>
                    )}
                    {isLow && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3" /> Low
                      </span>
                    )}
                    {!isOut && !isLow && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true) }}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No products found</div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          tenantId={tenantId}
          onSaved={handleSaved}
          onClose={() => { setShowModal(false); setEditingProduct(null) }}
        />
      )}
    </>
  )
}
