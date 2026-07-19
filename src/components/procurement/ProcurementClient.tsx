'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Truck, BookOpen, ShoppingBag, PackageCheck,
  Plus, Search, Edit2, X, Loader2, Send, CheckCircle,
  ChevronDown, Trash2, Phone, Mail, Star, AlertTriangle,
  FileText, Package, Download, Printer
} from 'lucide-react'
import { useTenantId } from '@/lib/hooks/useTenantId'
import ExportMenu from '@/components/shared/ExportMenu'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type {
  Supplier, SupplierCatalog, PurchaseOrder,
  PurchaseOrderItem, GoodsReceivedNote, GRNItem, Product,
  PurchaseOrderPayment
} from '@/types'

interface TenantBranding {
  name: string
  phone?: string
  address?: string
  kraPIN?: string
}

function useTenantBranding(): TenantBranding | null {
  const tenantId = useTenantId()
  const [branding, setBranding] = useState<TenantBranding | null>(null)
  useEffect(() => {
    if (!tenantId) return
    const supabase = createClient()
    supabase.from('tenants').select('name, phone, metadata').eq('id', tenantId).single()
      .then(({ data }) => {
        if (!data) return
        const meta = (data.metadata ?? {}) as Record<string, string>
        setBranding({ name: data.name, phone: data.phone ?? undefined, address: meta.address || undefined, kraPIN: meta.kra_pin || undefined })
      })
  }, [tenantId])
  return branding
}

const PDF_BLUE: [number, number, number] = [30, 64, 175]
const PDF_GRAY: [number, number, number] = [100, 116, 139]
const PDF_DARK: [number, number, number] = [30, 41, 59]

function printDocument(title: string, headHtml: string, bodyHtml: string) {
  const win = window.open('', '_blank', 'width=900,height=1200')
  win?.document.write(`<html><head><title>${title}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:40px 20px;background:white;line-height:1.5}
    .flex{display:flex}.justify-between{justify-content:space-between}
    .text-right{text-align:right}
    .mb-6{margin-bottom:1.5rem}.mb-4{margin-bottom:1rem}.mb-2{margin-bottom:.5rem}
    .text-2xl{font-size:22px}.text-xs{font-size:11px}
    .font-bold{font-weight:700}.font-semibold{font-weight:600}
    .text-blue-700{color:#1e40af}.text-slate-500{color:#64748b}.text-slate-800{color:#1e293b}
    hr{border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0}
    table{width:100%;border-collapse:collapse;margin-bottom:1.5rem}
    th{padding:10px 12px;font-size:12px;font-weight:600;text-align:left;background:#1e40af;color:white;border:1px solid #1e40af}
    th:last-child{text-align:right}
    td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f1f5f9}
    td:last-child{text-align:right}
    tbody tr:nth-child(even){background:#f8fafc}
    .totals{width:16rem;margin-left:auto}
    .totals div{display:flex;justify-content:space-between;margin-bottom:4px}
    @media print{body{padding:20px}}
  </style></head><body>${headHtml}<hr/>${bodyHtml}</body></html>`)
  win?.document.close()
  setTimeout(() => { win?.print(); win?.close() }, 250)
}

type Tab = 'suppliers' | 'catalog' | 'orders' | 'grn'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'catalog',   label: 'Supplier Catalog', icon: BookOpen },
  { id: 'orders',    label: 'Purchase Orders', icon: ShoppingBag },
  { id: 'grn',       label: 'Goods Received', icon: PackageCheck },
]

export default function ProcurementClient() {
  const [tab, setTab] = useState<Tab>('suppliers')
  const [traceSupplierId, setTraceSupplierId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Procurement</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage suppliers, catalogs, purchase orders, and stock receiving</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'suppliers' && <SuppliersTab onTraceSupplier={(id) => { setTraceSupplierId(id); setTab('orders') }} />}
      {tab === 'catalog'   && <CatalogTab />}
      {tab === 'orders'    && <PurchaseOrdersTab initialSupplierFilter={traceSupplierId} />}
      {tab === 'grn'       && <GRNTab />}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   SUPPLIERS TAB
────────────────────────────────────────────────────────────── */
function SuppliersTab({ onTraceSupplier }: { onTraceSupplier: (supplierId: string) => void }) {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    let q = supabase.from('suppliers').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name')
    if (search.trim()) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q.limit(100)
    setSuppliers((data as Supplier[]) ?? [])
    setLoading(false)
  }, [tenantId, search])

  useEffect(() => { load() }, [load])

  async function deactivateSupplier(s: Supplier) {
    if (!confirm(`Deactivate ${s.name}? They'll be hidden from supplier lists, but existing purchase orders and GRNs referencing them are kept.`)) return
    const { error } = await supabase.from('suppliers').update({ is_active: false }).eq('id', s.id)
    if (error) toast.error(error.message)
    else { toast.success('Supplier deactivated'); load() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            columns={[
              { header: 'Name', key: 'name', width: 22 },
              { header: 'Contact', key: 'contact_name', width: 18 },
              { header: 'Phone', key: 'phone', width: 14 },
              { header: 'Email', key: 'email', width: 22 },
              { header: 'VAT / KRA PIN', key: 'vat_number', width: 16 },
              { header: 'Lead Time (days)', key: 'lead_time_days', width: 12 },
              { header: 'Rating', key: 'rating', width: 8 },
              { header: 'Balance', key: 'balance', width: 12 },
            ]}
            rows={suppliers.map((s) => ({
              name: s.name,
              contact_name: s.contact_name ?? '',
              phone: s.phone ?? '',
              email: s.email ?? '',
              vat_number: (s as SupplierExt).vat_number ?? '',
              lead_time_days: (s as SupplierExt).lead_time_days ?? 3,
              rating: (s as SupplierExt).rating ?? '',
              balance: s.balance ?? 0,
            }))}
            filename={`suppliers-${new Date().toISOString().slice(0, 10)}`}
            title="Suppliers Report"
          />
          <button onClick={() => { setEditSupplier(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">VAT / KRA PIN</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lead Time</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Rating</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Balance</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
              ))
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No suppliers yet. Add your first supplier to get started.</p>
              </td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                        {(s as SupplierExt).is_preferred
                          ? <Star className="w-4 h-4 text-amber-500" />
                          : <Truck className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{s.name}</p>
                        {s.contact_name && <p className="text-xs text-slate-400 dark:text-slate-500">{s.contact_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                    {s.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                    {s.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                    {(s as SupplierExt).vat_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600 dark:text-slate-300">
                    {(s as SupplierExt).lead_time_days ?? 3} days
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(s as SupplierExt).rating
                      ? <span className="text-amber-500 font-semibold text-xs">★ {(s as SupplierExt).rating}</span>
                      : <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={(s.balance ?? 0) > 0 ? 'text-red-600 font-semibold text-xs' : 'text-slate-400 dark:text-slate-500 text-xs'}>
                      {formatCurrency(s.balance ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onTraceSupplier(s.id)} title="View this supplier's purchase orders"
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
                        <ShoppingBag className="w-3.5 h-3.5" /> POs
                      </button>
                      <button onClick={() => { setEditSupplier(s); setShowForm(true) }} title="Edit supplier"
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deactivateSupplier(s)} title="Deactivate supplier"
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && tenantId && (
        <SupplierFormModal
          supplier={editSupplier}
          tenantId={tenantId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   CATALOG TAB
────────────────────────────────────────────────────────────── */
function CatalogTab() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [items, setItems] = useState<SupplierCatalog[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [supplierFilter, setSupplierFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<SupplierCatalog | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const [suppRes, prodRes] = await Promise.all([
      supabase.from('suppliers').select('id,name').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
      supabase.from('products').select('id,name,sku,cost_price').eq('tenant_id', tenantId).eq('is_active', true).order('name').limit(200),
    ])
    setSuppliers((suppRes.data as Supplier[]) ?? [])
    setProducts((prodRes.data as Product[]) ?? [])

    let q = supabase.from('supplier_catalogs').select('*, supplier:suppliers(name)').eq('tenant_id', tenantId)
    if (supplierFilter) q = q.eq('supplier_id', supplierFilter)
    if (search.trim()) q = q.ilike('product_name', `%${search}%`)
    const { data } = await q.order('product_name').limit(200)
    setItems((data as SupplierCatalog[]) ?? [])
    setLoading(false)
  }, [tenantId, supplierFilter, search])

  useEffect(() => { load() }, [load])

  async function deleteItem(id: string) {
    if (!confirm('Remove this catalog item?')) return
    const { error } = await supabase.from('supplier_catalogs').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Item removed'); load() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Suppliers</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <ExportMenu
          columns={[
            { header: 'Product', key: 'product_name', width: 22 },
            { header: 'Supplier', key: 'supplier_name', width: 20 },
            { header: 'Supplier SKU', key: 'supplier_sku', width: 16 },
            { header: 'Unit Price', key: 'unit_price', width: 12 },
            { header: 'MOQ', key: 'moq', width: 8 },
            { header: 'VAT', key: 'vat_applicable', width: 8 },
            { header: 'Status', key: 'is_available', width: 12 },
          ]}
          rows={items.map((item) => ({
            product_name: item.product_name,
            supplier_name: (item.supplier as { name: string } | undefined)?.name ?? '',
            supplier_sku: item.supplier_sku ?? '',
            unit_price: item.unit_price,
            moq: item.moq,
            vat_applicable: item.vat_applicable ? 'VAT' : 'No VAT',
            is_available: item.is_available ? 'Available' : 'Unavailable',
          }))}
          filename={`supplier-catalog-${new Date().toISOString().slice(0, 10)}`}
          title="Supplier Catalog Report"
        />
        <button onClick={() => { setEditItem(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Supplier SKU</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Unit Price</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">MOQ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">VAT</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-slate-400 dark:text-slate-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No catalog items. Add supplier products to build your catalog.</p>
              </td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-white">{item.product_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                    {(item.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{item.supplier_sku ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 text-xs">{item.moq}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.vat_applicable ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {item.vat_applicable ? 'VAT' : 'No VAT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_available ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditItem(item); setShowForm(true) }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && tenantId && (
        <CatalogItemModal
          item={editItem}
          tenantId={tenantId}
          suppliers={suppliers}
          products={products}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   PURCHASE ORDERS TAB
────────────────────────────────────────────────────────────── */
function PurchaseOrdersTab({ initialSupplierFilter }: { initialSupplierFilter?: string | null }) {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [supplierFilter, setSupplierFilter] = useState<string>(initialSupplierFilter ?? '')
  const [showForm, setShowForm] = useState(false)
  const [editPO, setEditPO] = useState<PurchaseOrder | null>(null)
  const [detailPO, setDetailPO] = useState<PurchaseOrder | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkPay, setShowBulkPay] = useState(false)

  useEffect(() => {
    if (!tenantId) return
    supabase.from('suppliers').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name')
      .then(({ data }) => setAllSuppliers((data as Supplier[]) ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId])

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    let q = supabase.from('purchase_orders')
      .select('*, supplier:suppliers(name,email,phone,address,city)')
      .eq('tenant_id', tenantId)
    if (statusFilter) q = q.eq('status', statusFilter)
    if (paymentFilter) q = q.eq('payment_status', paymentFilter)
    if (supplierFilter) q = q.eq('supplier_id', supplierFilter)
    const { data } = await q.order('created_at', { ascending: false }).limit(100)
    setOrders((data as PurchaseOrder[]) ?? [])
    setLoading(false)
  }, [tenantId, statusFilter, paymentFilter, supplierFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setSelectedIds(new Set()) }, [statusFilter, paymentFilter, supplierFilter])

  const traceSupplierName = supplierFilter ? allSuppliers.find((s) => s.id === supplierFilter)?.name : null
  const payableOrders = orders.filter((po) => po.status !== 'cancelled' && po.total_amount - po.amount_paid > 0)
  const selectedPOs = orders.filter((po) => selectedIds.has(po.id))
  const allPayableSelected = payableOrders.length > 0 && payableOrders.every((po) => selectedIds.has(po.id))

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      if (allPayableSelected) return new Set()
      return new Set(payableOrders.map((po) => po.id))
    })
  }

  async function sendEmail(po: PurchaseOrder) {
    setSendingId(po.id)
    try {
      const res = await fetch('/api/purchase-orders/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po_id: po.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to send')
      toast.success('Purchase order emailed to supplier')
      load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSendingId(null)
    }
  }

  async function deletePO(po: PurchaseOrder) {
    if (!confirm(`Delete purchase order ${po.po_number}? This cannot be undone.`)) return
    setDeletingId(po.id)
    const { error: itemsErr } = await supabase.from('purchase_order_items').delete().eq('purchase_order_id', po.id)
    if (itemsErr) { toast.error(itemsErr.message); setDeletingId(null); return }
    const { error } = await supabase.from('purchase_orders').delete().eq('id', po.id)
    setDeletingId(null)
    if (error) toast.error(error.message)
    else { toast.success('Purchase order deleted'); load() }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    sent: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
    approved: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
    delivered: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
    partial: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
    cancelled: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  }

  return (
    <div className="space-y-4">
      {supplierFilter && traceSupplierName && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-xl text-sm text-blue-700 dark:text-blue-400">
          <ShoppingBag className="w-4 h-4 flex-shrink-0" />
          Tracing purchase orders for <strong>{traceSupplierName}</strong>
          <button onClick={() => setSupplierFilter('')} className="ml-auto text-xs underline hover:no-underline">Clear</button>
        </div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {['', 'draft', 'sent', 'approved', 'delivered', 'partial', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-medium transition capitalize ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {['', 'unpaid', 'partial', 'paid'].map((p) => (
            <button key={p} onClick={() => setPaymentFilter(p)}
              className={`px-3 py-2 text-xs font-medium transition capitalize ${
                paymentFilter === p ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}>
              {p || 'Any Payment'}
            </button>
          ))}
        </div>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Suppliers</option>
          {allSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex-1" />
        {selectedIds.size > 0 && (
          <button onClick={() => setShowBulkPay(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition">
            <CheckCircle className="w-4 h-4" /> Pay Selected ({selectedIds.size})
          </button>
        )}
        <ExportMenu
          columns={[
            { header: 'PO Number', key: 'po_number', width: 16 },
            { header: 'Supplier', key: 'supplier_name', width: 20 },
            { header: 'Type', key: 'po_type', width: 14 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Expected Delivery', key: 'expected_delivery_date', width: 16 },
            { header: 'Total', key: 'total_amount', width: 12 },
            { header: 'Payment Status', key: 'payment_status', width: 14 },
            { header: 'Amount Paid', key: 'amount_paid', width: 12 },
            { header: 'Balance Due', key: 'balance_due', width: 12 },
            { header: 'Supplier Invoice #', key: 'supplier_invoice_ref', width: 16 },
          ]}
          rows={orders.map((po) => ({
            po_number: po.po_number,
            supplier_name: (po.supplier as { name: string } | undefined)?.name ?? '',
            po_type: (po.po_type ?? 'purchase_order').replace('_', ' '),
            status: po.status,
            expected_delivery_date: po.expected_delivery_date ?? '',
            total_amount: po.total_amount,
            payment_status: po.payment_status,
            amount_paid: po.amount_paid,
            balance_due: po.total_amount - po.amount_paid,
            supplier_invoice_ref: po.supplier_invoice_ref ?? '',
          }))}
          filename={`purchase-orders-${new Date().toISOString().slice(0, 10)}`}
          title="Purchase Orders Report"
        />
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" checked={allPayableSelected} onChange={toggleSelectAll}
                  disabled={payableOrders.length === 0}
                  className="rounded" title="Select all payable orders" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">PO Number</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Expected Delivery</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-16 text-slate-400 dark:text-slate-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No purchase orders yet.</p>
              </td></tr>
            ) : (
              orders.map((po) => {
                const payable = po.status !== 'cancelled' && po.total_amount - po.amount_paid > 0
                return (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(po.id)} onChange={() => toggleSelect(po.id)}
                      disabled={!payable} title={payable ? 'Select for payment' : 'Nothing due'}
                      className="rounded disabled:opacity-30" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailPO(po)} className="font-mono text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold">
                      {po.po_number}
                    </button>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(po.created_at).toLocaleDateString('en-KE')}</p>
                    {po.supplier_invoice_ref && <p className="text-xs text-slate-400 dark:text-slate-500">Inv: {po.supplier_invoice_ref}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200 text-sm">
                    {(po.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{(po.po_type ?? 'purchase_order').replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[po.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${paymentStatusColors[po.payment_status] ?? paymentStatusColors.unpaid}`}>
                      {po.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                    {po.expected_delivery_date
                      ? new Date(po.expected_delivery_date).toLocaleDateString('en-KE')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(po.total_amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {po.status === 'draft' && (
                        <button
                          onClick={() => sendEmail(po)}
                          disabled={sendingId === po.id || !(po.supplier as SupplierWithEmail)?.email}
                          title={(po.supplier as SupplierWithEmail)?.email ? 'Email supplier' : 'Supplier has no email'}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition disabled:opacity-40"
                        >
                          {sendingId === po.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      )}
                      <button onClick={() => setDetailPO(po)} title="View PO"
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                      {po.status === 'draft' && (
                        <button onClick={() => setEditPO(po)} title="Edit PO"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {(po.status === 'draft' || po.status === 'cancelled') && (
                        <button onClick={() => deletePO(po)} disabled={deletingId === po.id} title="Delete PO"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition disabled:opacity-40">
                          {deletingId === po.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {(showForm || editPO) && tenantId && (
        <CreatePOModal
          tenantId={tenantId}
          editPO={editPO}
          onClose={() => { setShowForm(false); setEditPO(null) }}
          onSaved={() => { setShowForm(false); setEditPO(null); load() }}
        />
      )}
      {detailPO && (
        <PODetailModal po={detailPO} onClose={() => { setDetailPO(null); load() }} />
      )}
      {showBulkPay && selectedPOs.length > 0 && (
        <BulkPayModal
          orders={selectedPOs}
          onClose={() => setShowBulkPay(false)}
          onPaid={() => { setShowBulkPay(false); setSelectedIds(new Set()); load() }}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   GOODS RECEIVED NOTES TAB
────────────────────────────────────────────────────────────── */
function GRNTab() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editGRN, setEditGRN] = useState<GoodsReceivedNote | null>(null)
  const [detailGRN, setDetailGRN] = useState<GoodsReceivedNote | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data } = await supabase
      .from('goods_received_notes')
      .select('*, supplier:suppliers(name,email,phone,address,city), purchase_order:purchase_orders(po_number)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100)
    setGrns((data as GoodsReceivedNote[]) ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  async function confirmGRN(grnId: string) {
    if (!confirm('Confirm this GRN? This will update product stock levels.')) return
    setConfirming(grnId)
    const { error } = await supabase.rpc('confirm_grn', { p_grn_id: grnId })
    setConfirming(null)
    if (error) toast.error(error.message)
    else { toast.success('GRN confirmed — stock updated'); load() }
  }

  async function deleteGRN(grn: GoodsReceivedNote) {
    if (!confirm(`Delete GRN ${grn.grn_number}? This cannot be undone.`)) return
    setDeletingId(grn.id)
    const { error: itemsErr } = await supabase.from('grn_items').delete().eq('grn_id', grn.id)
    if (itemsErr) { toast.error(itemsErr.message); setDeletingId(null); return }
    const { error } = await supabase.from('goods_received_notes').delete().eq('id', grn.id)
    setDeletingId(null)
    if (error) toast.error(error.message)
    else { toast.success('GRN deleted'); load() }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    confirmed: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
    partial: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <ExportMenu
          columns={[
            { header: 'GRN Number', key: 'grn_number', width: 16 },
            { header: 'Supplier', key: 'supplier_name', width: 20 },
            { header: 'Linked PO', key: 'po_number', width: 16 },
            { header: 'Received Date', key: 'received_date', width: 14 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Total Cost', key: 'total_cost', width: 12 },
          ]}
          rows={grns.map((grn) => ({
            grn_number: grn.grn_number,
            supplier_name: (grn.supplier as { name: string } | undefined)?.name ?? '',
            po_number: (grn.purchase_order as { po_number: string } | undefined)?.po_number ?? '',
            received_date: grn.received_date,
            status: grn.status,
            total_cost: grn.total_cost,
          }))}
          filename={`goods-received-${new Date().toISOString().slice(0, 10)}`}
          title="Goods Received Report"
        />
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New GRN
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">GRN Number</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Linked PO</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Received Date</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Cost</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
              ))
            ) : grns.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400 dark:text-slate-500">
                <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No goods received notes yet.</p>
              </td></tr>
            ) : (
              grns.map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailGRN(grn)} className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      {grn.grn_number}
                    </button>
                    {grn.supplier_invoice_ref && <p className="text-xs text-slate-400 dark:text-slate-500">Inv: {grn.supplier_invoice_ref}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200 text-sm">
                    {(grn.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-blue-600 dark:text-blue-400">
                    {(grn.purchase_order as { po_number: string } | undefined)?.po_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                    {new Date(grn.received_date).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[grn.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {grn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(grn.total_cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailGRN(grn)} title="View GRN"
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                      {grn.status === 'draft' && (
                        <button
                          onClick={() => confirmGRN(grn.id)}
                          disabled={confirming === grn.id}
                          title="Confirm & update stock"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition disabled:opacity-40"
                        >
                          {confirming === grn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                      {grn.status === 'draft' && (
                        <button onClick={() => setEditGRN(grn)} title="Edit GRN"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {grn.status === 'draft' && (
                        <button onClick={() => deleteGRN(grn)} disabled={deletingId === grn.id} title="Delete GRN"
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition disabled:opacity-40">
                          {deletingId === grn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(showCreate || editGRN) && tenantId && (
        <CreateGRNModal
          tenantId={tenantId}
          editGRN={editGRN}
          onClose={() => { setShowCreate(false); setEditGRN(null) }}
          onSaved={() => { setShowCreate(false); setEditGRN(null); load() }}
        />
      )}
      {detailGRN && (
        <GRNDetailModal grn={detailGRN} onClose={() => { setDetailGRN(null); load() }} />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   MODALS
────────────────────────────────────────────────────────────── */

// Types for extended supplier/product objects
type SupplierExt = Supplier & { vat_number?: string; lead_time_days?: number; is_preferred?: boolean; rating?: number }
type SupplierWithEmail = { email?: string }

function SupplierFormModal({ supplier, tenantId, onClose, onSaved }: {
  supplier: Supplier | null; tenantId: string; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const s = supplier as SupplierExt | null
  const [form, setForm] = useState({
    name: s?.name ?? '',
    contact_name: s?.contact_name ?? '',
    phone: s?.phone ?? '',
    email: s?.email ?? '',
    address: s?.address ?? '',
    city: s?.city ?? '',
    vat_number: s?.vat_number ?? '',
    website: (s as Record<string, string> | null)?.website ?? '',
    lead_time_days: String(s?.lead_time_days ?? 3),
    notes: s?.notes ?? '',
    is_preferred: s?.is_preferred ?? false,
    rating: String(s?.rating ?? ''),
  })

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Supplier name is required'); return }
    setLoading(true)
    const payload = {
      ...form,
      lead_time_days: parseInt(form.lead_time_days) || 3,
      rating: form.rating ? parseFloat(form.rating) : null,
      tenant_id: tenantId,
    }
    const { error } = supplier
      ? await supabase.from('suppliers').update(payload).eq('id', supplier.id)
      : await supabase.from('suppliers').insert(payload)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(supplier ? 'Supplier updated' : 'Supplier created')
    onSaved()
  }

  return (
    <ModalShell title={supplier ? 'Edit Supplier' : 'New Supplier'} onClose={onClose} maxW="max-w-lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'name', label: 'Company Name *', required: true, col: 2 },
            { key: 'contact_name', label: 'Contact Person' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'vat_number', label: 'VAT / KRA PIN' },
            { key: 'website', label: 'Website' },
            { key: 'city', label: 'City' },
            { key: 'lead_time_days', label: 'Lead Time (days)', type: 'number' },
            { key: 'address', label: 'Address', col: 2 },
            { key: 'notes', label: 'Notes', col: 2 },
          ].map(({ key, label, required, type, col }) => (
            <div key={key} className={col === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
              <input
                required={required}
                type={type ?? 'text'}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className={ic}
              />
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_preferred}
                onChange={(e) => setForm((f) => ({ ...f, is_preferred: e.target.checked }))}
                className="rounded" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Mark as Preferred Supplier</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {supplier ? 'Save Changes' : 'Create Supplier'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function CatalogItemModal({ item, tenantId, suppliers, products, onClose, onSaved }: {
  item: SupplierCatalog | null; tenantId: string
  suppliers: Supplier[]; products: Product[]
  onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    supplier_id: item?.supplier_id ?? '',
    product_id: item?.product_id ?? '',
    product_name: item?.product_name ?? '',
    supplier_sku: item?.supplier_sku ?? '',
    unit: item?.unit ?? 'pcs',
    unit_price: String(item?.unit_price ?? ''),
    moq: String(item?.moq ?? 1),
    vat_applicable: item?.vat_applicable ?? true,
    is_available: item?.is_available ?? true,
    notes: item?.notes ?? '',
  })
  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  function handleProductSelect(productId: string) {
    const prod = products.find((p) => p.id === productId)
    setForm((f) => ({
      ...f,
      product_id: productId,
      product_name: prod?.name ?? f.product_name,
      supplier_sku: prod?.sku ?? f.supplier_sku,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Select a supplier'); return }
    if (!form.product_name.trim()) { toast.error('Product name required'); return }
    setLoading(true)
    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price) || 0,
      moq: parseInt(form.moq) || 1,
      product_id: form.product_id || null,
      tenant_id: tenantId,
    }
    const { error } = item
      ? await supabase.from('supplier_catalogs').update(payload).eq('id', item.id)
      : await supabase.from('supplier_catalogs').insert(payload)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(item ? 'Catalog item updated' : 'Catalog item added')
    onSaved()
  }

  return (
    <ModalShell title={item ? 'Edit Catalog Item' : 'Add Catalog Item'} onClose={onClose} maxW="max-w-md">
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Supplier *</label>
          <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))} className={ic} required>
            <option value="">Select supplier…</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Linked Product (optional)</label>
          <select value={form.product_id} onChange={(e) => handleProductSelect(e.target.value)} className={ic}>
            <option value="">None</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {[
          { key: 'product_name', label: 'Product Name *', required: true },
          { key: 'supplier_sku', label: 'Supplier SKU' },
          { key: 'unit', label: 'Unit' },
          { key: 'unit_price', label: 'Unit Price *', type: 'number', required: true },
          { key: 'moq', label: 'Min. Order Qty (MOQ)', type: 'number' },
          { key: 'notes', label: 'Notes' },
        ].map(({ key, label, required, type }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
            <input required={required} type={type ?? 'text'}
              value={form[key as keyof typeof form] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className={ic} />
          </div>
        ))}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={form.vat_applicable}
              onChange={(e) => setForm((f) => ({ ...f, vat_applicable: e.target.checked }))} className="rounded" />
            VAT Applicable
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} className="rounded" />
            Available
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Save' : 'Add Item'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function CreatePOModal({ tenantId, editPO, onClose, onSaved }: {
  tenantId: string; editPO?: PurchaseOrder | null; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [catalog, setCatalog] = useState<SupplierCatalog[]>([])
  const [form, setForm] = useState({
    supplier_id: editPO?.supplier_id ?? '',
    po_type: (editPO?.po_type ?? 'purchase_order') as POType,
    expected_delivery_date: editPO?.expected_delivery_date ?? '',
    notes: editPO?.notes ?? '',
    vat_rate: 16,
  })
  const [items, setItems] = useState<Array<{
    product_id: string; product_name: string; product_sku: string
    quantity: number; unit: string; unit_price: number; vat_rate: number
  }>>([])

  useEffect(() => {
    Promise.all([
      supabase.from('suppliers').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
      supabase.from('products').select('id,name,sku,cost_price,unit').eq('tenant_id', tenantId).eq('is_active', true).order('name').limit(200),
    ]).then(([sRes, pRes]) => {
      setSuppliers((sRes.data as Supplier[]) ?? [])
      setProducts((pRes.data as Product[]) ?? [])
    })
  }, [tenantId])

  useEffect(() => {
    if (!editPO) return
    supabase.from('purchase_order_items').select('*').eq('purchase_order_id', editPO.id)
      .then(({ data }) => {
        setItems(((data as PurchaseOrderItem[]) ?? []).map((it) => ({
          product_id: it.product_id ?? '',
          product_name: it.product_name,
          product_sku: it.product_sku ?? '',
          quantity: it.quantity,
          unit: it.unit,
          unit_price: it.unit_price,
          vat_rate: it.vat_rate,
        })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPO?.id])

  useEffect(() => {
    if (!form.supplier_id) { setCatalog([]); return }
    supabase.from('supplier_catalogs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('supplier_id', form.supplier_id)
      .eq('is_available', true)
      .then(({ data }) => setCatalog((data as SupplierCatalog[]) ?? []))
  }, [form.supplier_id, tenantId])

  function addItem() {
    setItems((prev) => [...prev, { product_id: '', product_name: '', product_sku: '', quantity: 1, unit: 'pcs', unit_price: 0, vat_rate: form.vat_rate }])
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== i) return item
      if (field === 'product_id') {
        const cat = catalog.find((c) => c.id === value)
        const prod = products.find((p) => p.id === value)
        if (cat) return { ...item, product_id: cat.product_id ?? '', product_name: cat.product_name, product_sku: cat.supplier_sku ?? '', unit: cat.unit, unit_price: cat.unit_price, vat_rate: cat.vat_applicable ? form.vat_rate : 0 }
        if (prod) return { ...item, product_id: prod.id, product_name: prod.name, product_sku: prod.sku ?? '', unit: prod.unit, unit_price: prod.cost_price }
      }
      return { ...item, [field]: value }
    }))
  }

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0)
  const vatTotal = items.reduce((s, it) => s + (it.quantity * it.unit_price * it.vat_rate / 100), 0)
  const total = subtotal + vatTotal

  function buildPOItems(poId: string) {
    return items.map((it) => {
      const lineTotal = it.quantity * it.unit_price * (1 + it.vat_rate / 100)
      return {
        po_id: poId,
        purchase_order_id: poId,
        tenant_id: tenantId,
        product_id: it.product_id || null,
        product_name: it.product_name,
        product_sku: it.product_sku || null,
        ordered_qty: it.quantity,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        total_price: lineTotal,
        vat_rate: it.vat_rate,
        vat_amount: it.quantity * it.unit_price * it.vat_rate / 100,
        total: lineTotal,
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Select a supplier'); return }
    if (items.length === 0) { toast.error('Add at least one item'); return }
    setLoading(true)

    if (editPO) {
      const { error: updateError } = await supabase.from('purchase_orders').update({
        supplier_id: form.supplier_id || null,
        po_type: form.po_type,
        subtotal,
        vat_amount: vatTotal,
        total_amount: total,
        expected_delivery_date: form.expected_delivery_date || null,
        notes: form.notes || null,
      }).eq('id', editPO.id)
      if (updateError) { toast.error(updateError.message); setLoading(false); return }

      const { error: delErr } = await supabase.from('purchase_order_items').delete().eq('purchase_order_id', editPO.id)
      if (delErr) { toast.error(delErr.message); setLoading(false); return }

      const { error: itemsError } = await supabase.from('purchase_order_items').insert(buildPOItems(editPO.id))
      setLoading(false)
      if (itemsError) { toast.error(itemsError.message); return }
      toast.success('Purchase order updated')
      onSaved()
      return
    }

    const { data: poData, error: poError } = await supabase.rpc('generate_po_number', { p_tenant_id: tenantId })
    if (poError) { toast.error(poError.message); setLoading(false); return }

    const { data: po, error: insertError } = await supabase.from('purchase_orders').insert({
      tenant_id: tenantId,
      supplier_id: form.supplier_id || null,
      po_number: poData as string,
      po_type: form.po_type,
      status: 'draft',
      subtotal,
      vat_amount: vatTotal,
      discount_amount: 0,
      total_amount: total,
      expected_delivery_date: form.expected_delivery_date || null,
      notes: form.notes || null,
    }).select('id').single()

    if (insertError || !po) { toast.error(insertError?.message ?? 'Failed to create PO'); setLoading(false); return }

    const { error: itemsError } = await supabase.from('purchase_order_items').insert(buildPOItems(po.id))
    setLoading(false)
    if (itemsError) { toast.error(itemsError.message); return }
    toast.success('Purchase order created')
    onSaved()
  }

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <ModalShell title={editPO ? `Edit Purchase Order: ${editPO.po_number}` : 'New Purchase Order'} onClose={onClose} maxW="max-w-3xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Supplier *</label>
            <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))} className={ic} required>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Order Type</label>
            <select value={form.po_type} onChange={(e) => setForm((f) => ({ ...f, po_type: e.target.value as POType }))} className={ic}>
              <option value="purchase_order">Purchase Order</option>
              <option value="purchase_request">Purchase Request</option>
              <option value="rfq">Request for Quotation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Expected Delivery Date</label>
            <input type="date" value={form.expected_delivery_date} onChange={(e) => setForm((f) => ({ ...f, expected_delivery_date: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Default VAT Rate (%)</label>
            <input type="number" min="0" max="100" value={form.vat_rate}
              onChange={(e) => setForm((f) => ({ ...f, vat_rate: parseFloat(e.target.value) || 0 }))} className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={ic} />
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Order Items</p>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Click &quot;Add Item&quot; to add products to this order
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Product</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Custom / Type below</option>
                      {catalog.length > 0 && (
                        <optgroup label="— Supplier Catalog —">
                          {catalog.map((c) => <option key={c.id} value={c.id}>{c.product_name} @ {formatCurrency(c.unit_price)}</option>)}
                        </optgroup>
                      )}
                      <optgroup label="— Inventory Products —">
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </optgroup>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Name</label>
                    <input value={item.product_name} onChange={(e) => updateItem(i, 'product_name', e.target.value)}
                      placeholder="Product name" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Unit Price</label>
                    <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">VAT%</label>
                    <input type="number" min="0" max="100" value={item.vat_rate} onChange={(e) => updateItem(i, 'vat_rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1 flex flex-col items-end">
                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">&nbsp;</span>
                    <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>VAT</span><span>{formatCurrency(vatTotal)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1 mt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editPO ? 'Save Changes' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

type POType = 'purchase_request' | 'rfq' | 'purchase_order'

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  partial: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  paid: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank Transfer', mpesa: 'M-Pesa', cheque: 'Cheque', other: 'Other',
}

function PODetailModal({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
  const supabase = createClient()
  const branding = useTenantBranding()
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('bank_transfer')
  const [payReference, setPayReference] = useState(po.supplier_invoice_ref ?? '')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [paying, setPaying] = useState(false)
  const [payments, setPayments] = useState<PurchaseOrderPayment[]>([])
  const [invoiceRef, setInvoiceRef] = useState(po.supplier_invoice_ref ?? '')
  const [savedInvoiceRef, setSavedInvoiceRef] = useState(po.supplier_invoice_ref ?? '')
  const [savingRef, setSavingRef] = useState(false)
  const balanceDue = po.total_amount - po.amount_paid

  useEffect(() => {
    supabase.from('purchase_order_items').select('*').eq('purchase_order_id', po.id)
      .then(({ data }) => { setItems((data as PurchaseOrderItem[]) ?? []); setLoading(false) })
    supabase.from('purchase_order_payments').select('*').eq('purchase_order_id', po.id)
      .order('payment_date', { ascending: false })
      .then(({ data }) => setPayments((data as PurchaseOrderPayment[]) ?? []))
  }, [po.id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', po.id)
    setUpdating(false)
    if (error) toast.error(error.message)
    else { toast.success(`Status updated to ${status}`); onClose() }
  }

  async function saveInvoiceRef() {
    setSavingRef(true)
    const trimmed = invoiceRef.trim()
    const { error } = await supabase.from('purchase_orders')
      .update({ supplier_invoice_ref: trimmed || null }).eq('id', po.id)
    setSavingRef(false)
    if (error) { toast.error(error.message); return }
    setSavedInvoiceRef(trimmed)
    toast.success('Supplier invoice number saved')
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return }
    if (amount > balanceDue) { toast.error(`Amount exceeds balance due (${formatCurrency(balanceDue)})`); return }
    setPaying(true)
    const { error } = await supabase.rpc('pay_purchase_orders', {
      p_payments: [{
        purchase_order_id: po.id,
        amount,
        payment_method: payMethod,
        reference: payReference.trim() || null,
        payment_date: payDate,
      }],
    })
    setPaying(false)
    if (error) toast.error(error.message)
    else { toast.success('Payment recorded'); onClose() }
  }

  const sup = po.supplier as { name?: string; email?: string; phone?: string; address?: string; city?: string } | undefined

  function supplierBlockHtml() {
    return `<div class="mb-6"><p class="text-xs font-bold text-slate-500" style="text-transform:uppercase;margin-bottom:8px">Supplier</p>
      <p class="font-semibold text-slate-800">${sup?.name ?? '—'}</p>
      ${sup?.address ? `<p class="text-slate-500 text-xs">${sup.address}${sup.city ? ', ' + sup.city : ''}</p>` : ''}
      ${sup?.phone ? `<p class="text-slate-500 text-xs">Tel: ${sup.phone}</p>` : ''}
      ${sup?.email ? `<p class="text-slate-500 text-xs">${sup.email}</p>` : ''}
    </div>`
  }

  function itemRowsHtml() {
    return items.map((it, i) => `<tr class="${i % 2 === 1 ? 'bg' : ''}">
      <td>${it.product_name}</td>
      <td>${it.quantity} ${it.unit}</td>
      <td>${formatCurrency(it.unit_price)}</td>
      <td>${formatCurrency(it.vat_amount)}</td>
      <td>${formatCurrency(it.total)}</td>
    </tr>`).join('')
  }

  function totalsHtml() {
    return `<div class="totals">
      <div><span class="text-slate-500">Subtotal</span><span>${formatCurrency(po.subtotal)}</span></div>
      <div><span class="text-slate-500">VAT</span><span>${formatCurrency(po.vat_amount)}</span></div>
      <div class="font-bold text-blue-700" style="border-top:1px solid #bfdbfe;padding-top:6px;margin-top:4px"><span>TOTAL</span><span>${formatCurrency(po.total_amount)}</span></div>
      <div><span class="text-slate-500">Amount Paid</span><span>${formatCurrency(po.amount_paid)}</span></div>
      <div class="font-semibold" style="border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px"><span>Balance Due</span><span>${formatCurrency(po.total_amount - po.amount_paid)}</span></div>
    </div>`
  }

  function handlePrint() {
    const headHtml = `<div class="flex justify-between mb-4">
      <div><p class="text-2xl font-bold text-blue-700">${branding?.name ?? 'Store'}</p>
        <div class="text-slate-500 text-xs" style="margin-top:4px">
          ${branding?.address ? `<p>${branding.address}</p>` : ''}
          ${branding?.phone ? `<p>Tel: ${branding.phone}</p>` : ''}
          ${branding?.kraPIN ? `<p>KRA PIN: ${branding.kraPIN}</p>` : ''}
        </div>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-blue-700">PURCHASE ORDER</p>
        <div class="text-slate-500 text-xs" style="margin-top:8px">
          <p><span class="font-semibold text-slate-800">PO #:</span> ${po.po_number}</p>
          <p><span class="font-semibold text-slate-800">Date:</span> ${new Date(po.created_at).toLocaleDateString('en-KE')}</p>
          <p><span class="font-semibold text-slate-800">Status:</span> ${po.status}</p>
          <p><span class="font-semibold text-slate-800">Payment:</span> ${po.payment_status}</p>
        </div>
      </div>
    </div>`
    const bodyHtml = `${supplierBlockHtml()}
      <table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>VAT</th><th>Total</th></tr></thead>
      <tbody>${itemRowsHtml()}</tbody></table>
      ${totalsHtml()}
      ${po.notes ? `<p class="text-xs text-slate-500 mb-2" style="margin-top:16px">Notes: ${po.notes}</p>` : ''}`
    printDocument(`Purchase Order ${po.po_number}`, headHtml, bodyHtml)
  }

  function handleDownloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    doc.setFontSize(20); doc.setTextColor(...PDF_BLUE); doc.setFont('helvetica', 'bold')
    doc.text(branding?.name ?? 'Store', 15, 22)
    doc.setFontSize(18); doc.text('PURCHASE ORDER', 195, 22, { align: 'right' })

    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_GRAY)
    let y = 28
    if (branding?.address) { doc.text(branding.address, 15, y); y += 5 }
    if (branding?.phone) { doc.text(`Tel: ${branding.phone}`, 15, y); y += 5 }
    if (branding?.kraPIN) doc.text(`KRA PIN: ${branding.kraPIN}`, 15, y)
    doc.text(`PO #: ${po.po_number}`, 195, 28, { align: 'right' })
    doc.text(`Date: ${new Date(po.created_at).toLocaleDateString('en-KE')}`, 195, 33, { align: 'right' })
    doc.text(`Status: ${po.status}`, 195, 38, { align: 'right' })

    doc.setDrawColor(226, 232, 240); doc.line(15, 43, 195, 43)

    doc.setFontSize(8); doc.setTextColor(...PDF_GRAY); doc.setFont('helvetica', 'bold')
    doc.text('SUPPLIER', 15, 50)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...PDF_DARK)
    doc.text(sup?.name ?? '—', 15, 56)
    let supY = 61
    if (sup?.address) { doc.setFontSize(9); doc.setTextColor(...PDF_GRAY); doc.text(`${sup.address}${sup.city ? ', ' + sup.city : ''}`, 15, supY); supY += 5 }
    if (sup?.phone) { doc.text(`Tel: ${sup.phone}`, 15, supY) }

    autoTable(doc, {
      startY: 68,
      head: [['Product', 'Qty', 'Unit Price', 'VAT', 'Total']],
      body: items.map((it) => [it.product_name, `${it.quantity} ${it.unit}`, formatCurrency(it.unit_price), formatCurrency(it.vat_amount), formatCurrency(it.total)]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: PDF_BLUE, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
    const totalsX = 130
    doc.setFontSize(9); doc.setTextColor(...PDF_GRAY); doc.text('Subtotal', totalsX, afterTable + 6)
    doc.setTextColor(...PDF_DARK); doc.text(formatCurrency(po.subtotal), 195, afterTable + 6, { align: 'right' })
    doc.setTextColor(...PDF_GRAY); doc.text('VAT', totalsX, afterTable + 12)
    doc.setTextColor(...PDF_DARK); doc.text(formatCurrency(po.vat_amount), 195, afterTable + 12, { align: 'right' })
    doc.setDrawColor(...PDF_BLUE); doc.line(totalsX, afterTable + 15, 195, afterTable + 15)
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PDF_BLUE)
    doc.text('TOTAL', totalsX, afterTable + 21)
    doc.text(formatCurrency(po.total_amount), 195, afterTable + 21, { align: 'right' })

    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_GRAY)
    doc.text('Amount Paid', totalsX, afterTable + 28)
    doc.setTextColor(...PDF_DARK); doc.text(formatCurrency(po.amount_paid), 195, afterTable + 28, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text('Balance Due', totalsX, afterTable + 34)
    doc.text(formatCurrency(po.total_amount - po.amount_paid), 195, afterTable + 34, { align: 'right' })

    if (po.notes) {
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_GRAY)
      doc.text(`Notes: ${po.notes}`, 15, afterTable + 45)
    }

    doc.save(`PO-${po.po_number}.pdf`)
  }

  return (
    <ModalShell title={`Purchase Order: ${po.po_number}`} onClose={onClose} maxW="max-w-2xl">
      <div className="p-5 space-y-4">
        <div className="flex justify-end gap-2">
          <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Supplier</p><p className="font-medium text-slate-800 dark:text-white">{sup?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span className="capitalize font-medium text-slate-800 dark:text-white">{po.status}</span>
          </div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Type</p><p className="capitalize text-slate-700 dark:text-slate-200">{po.po_type?.replace('_', ' ') ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Expected Delivery</p>
            <p className="text-slate-700 dark:text-slate-200">{po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-KE') : '—'}</p>
          </div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Payment</p>
            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium capitalize ${paymentStatusColors[po.payment_status] ?? paymentStatusColors.unpaid}`}>
              {po.payment_status}
            </span>
          </div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Balance Due</p>
            <p className={`font-semibold ${balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{formatCurrency(balanceDue)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Supplier Invoice # <span className="normal-case text-slate-400 dark:text-slate-500">(for tracing payments)</span></p>
            <div className="flex items-center gap-2">
              <input value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="e.g. INV-4021"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {invoiceRef !== savedInvoiceRef && (
                <button onClick={saveInvoiceRef} disabled={savingRef}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-1">
                  {savingRef && <Loader2 className="w-3 h-3 animate-spin" />} Save
                </button>
              )}
            </div>
          </div>
          {po.notes && <div className="col-span-2"><p className="text-xs text-slate-500 dark:text-slate-400">Notes</p><p className="text-slate-700 dark:text-slate-200">{po.notes}</p></div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase">
              <th className="text-left px-3 py-2">Product</th>
              <th className="text-right px-3 py-2">Qty</th>
              <th className="text-right px-3 py-2">Unit Price</th>
              <th className="text-right px-3 py-2">VAT</th>
              <th className="text-right px-3 py-2">Total</th>
              <th className="text-right px-3 py-2">Received</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6}><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse m-2" /></td></tr>
              ) : items.map((it) => (
                <tr key={it.id}>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{it.product_name}</td>
                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{it.quantity} {it.unit}</td>
                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{formatCurrency(it.unit_price)}</td>
                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{formatCurrency(it.vat_amount)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(it.total)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={it.received_quantity >= it.quantity ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                      {it.received_quantity}/{it.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Subtotal</span><span>{formatCurrency(po.subtotal)}</span></div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>VAT</span><span>{formatCurrency(po.vat_amount)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1"><span>Total</span><span>{formatCurrency(po.total_amount)}</span></div>
          <div className="flex justify-between text-green-600 dark:text-green-400"><span>Amount Paid</span><span>{formatCurrency(po.amount_paid)}</span></div>
          <div className="flex justify-between font-semibold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1"><span>Balance Due</span><span>{formatCurrency(balanceDue)}</span></div>
        </div>

        {payments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Payment History</p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{new Date(p.payment_date).toLocaleDateString('en-KE')}</span>
                    <span className="text-slate-400 dark:text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method}</span>
                    {p.reference && <span className="text-slate-400 dark:text-slate-500"> · Ref: {p.reference}</span>}
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {po.status !== 'cancelled' && balanceDue > 0 && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            {showPayForm ? (
              <form onSubmit={recordPayment} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" max={balanceDue} step="0.01" autoFocus
                    value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`Up to ${formatCurrency(balanceDue)}`}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input value={payReference} onChange={(e) => setPayReference(e.target.value)}
                    placeholder="Supplier invoice # / txn ref"
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={paying}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-40 flex items-center gap-1.5">
                    {paying && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Record Payment
                  </button>
                  <button type="button" onClick={() => setShowPayForm(false)} className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowPayForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                <CheckCircle className="w-4 h-4" /> Record Payment
              </button>
            )}
          </div>
        )}

        {po.status !== 'cancelled' && po.status !== 'delivered' && (
          <div className="flex gap-2 flex-wrap">
            {po.status === 'sent' && (
              <button onClick={() => updateStatus('approved')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {(po.status === 'approved' || po.status === 'partial') && (
              <button onClick={() => updateStatus('delivered')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                <PackageCheck className="w-4 h-4" /> Mark Delivered
              </button>
            )}
            <button onClick={() => updateStatus('cancelled')} disabled={updating}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition">
              Cancel PO
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function BulkPayModal({ orders, onClose, onPaid }: {
  orders: PurchaseOrder[]; onClose: () => void; onPaid: () => void
}) {
  const supabase = createClient()
  const [payMethod, setPayMethod] = useState('bank_transfer')
  const [payReference, setPayReference] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payNotes, setPayNotes] = useState('')
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(orders.map((po) => [po.id, String(po.total_amount - po.amount_paid)]))
  )
  const [paying, setPaying] = useState(false)

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  const total = orders.reduce((s, po) => s + (parseFloat(amounts[po.id]) || 0), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payments = orders
      .map((po) => ({ po, amount: parseFloat(amounts[po.id]) || 0 }))
      .filter(({ amount }) => amount > 0)

    if (payments.length === 0) { toast.error('Enter at least one payment amount'); return }
    for (const { po, amount } of payments) {
      const balanceDue = po.total_amount - po.amount_paid
      if (amount > balanceDue) {
        toast.error(`Amount for ${po.po_number} exceeds balance due (${formatCurrency(balanceDue)})`)
        return
      }
    }

    setPaying(true)
    const { error } = await supabase.rpc('pay_purchase_orders', {
      p_payments: payments.map(({ po, amount }) => ({
        purchase_order_id: po.id,
        amount,
        payment_method: payMethod,
        reference: payReference.trim() || null,
        payment_date: payDate,
        notes: payNotes.trim() || null,
      })),
    })
    setPaying(false)
    if (error) { toast.error(error.message); return }
    toast.success(`Recorded ${payments.length} payment${payments.length > 1 ? 's' : ''}`)
    onPaid()
  }

  return (
    <ModalShell title={`Pay ${orders.length} Purchase Order${orders.length > 1 ? 's' : ''}`} onClose={onClose} maxW="max-w-lg">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden max-h-56 overflow-y-auto">
          {orders.map((po) => {
            const balanceDue = po.total_amount - po.amount_paid
            return (
              <div key={po.id} className="flex items-center gap-3 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 truncate">{po.po_number}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {(po.supplier as { name: string } | undefined)?.name ?? '—'}
                    {po.supplier_invoice_ref && <span className="text-slate-400 dark:text-slate-500"> · Inv: {po.supplier_invoice_ref}</span>}
                  </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">of {formatCurrency(balanceDue)}</p>
                <input type="number" min="0" max={balanceDue} step="0.01"
                  value={amounts[po.id] ?? ''}
                  onChange={(e) => setAmounts((a) => ({ ...a, [po.id]: e.target.value }))}
                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Payment Method</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={ic}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Payment Date</label>
            <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Supplier Invoice # / Transaction Ref <span className="text-slate-400 dark:text-slate-500 font-normal normal-case">(applied to every selected PO for trace)</span>
            </label>
            <input value={payReference} onChange={(e) => setPayReference(e.target.value)}
              placeholder="e.g. INV-4021 or M-Pesa code" className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes (optional)</label>
            <input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className={ic} />
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Total to pay</span>
          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</span>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={paying || total <= 0}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            {paying && <Loader2 className="w-4 h-4 animate-spin" />}
            Record {formatCurrency(total)} Payment
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function CreateGRNModal({ tenantId, editGRN, onClose, onSaved }: {
  tenantId: string; editGRN?: GoodsReceivedNote | null; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([])
  const [form, setForm] = useState({
    supplier_id: editGRN?.supplier_id ?? '',
    purchase_order_id: editGRN?.purchase_order_id ?? '',
    supplier_invoice_ref: editGRN?.supplier_invoice_ref ?? '',
    received_date: editGRN?.received_date ?? new Date().toISOString().slice(0, 10),
    notes: editGRN?.notes ?? '',
  })
  const [items, setItems] = useState<Array<{
    product_id: string; product_name: string; po_item_id: string
    ordered_qty: number; received_qty: number; damaged_qty: number
    unit_cost: number; vat_rate: number; batch_number: string; expiry_date: string
  }>>([])

  useEffect(() => {
    supabase.from('suppliers').select('id,name').eq('tenant_id', tenantId).eq('is_active', true).order('name')
      .then(({ data }) => setSuppliers((data as Supplier[]) ?? []))
  }, [tenantId])

  useEffect(() => {
    if (!editGRN) return
    supabase.from('grn_items').select('*').eq('grn_id', editGRN.id)
      .then(({ data }) => {
        setItems(((data as GRNItem[]) ?? []).map((it) => ({
          product_id: it.product_id ?? '',
          product_name: it.product_name,
          po_item_id: it.po_item_id ?? '',
          ordered_qty: it.ordered_qty,
          received_qty: it.received_qty,
          damaged_qty: it.damaged_qty,
          unit_cost: it.unit_cost,
          vat_rate: it.vat_rate,
          batch_number: it.batch_number ?? '',
          expiry_date: it.expiry_date ?? '',
        })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editGRN?.id])

  useEffect(() => {
    if (!form.supplier_id) { setPos([]); return }
    supabase.from('purchase_orders').select('id,po_number').eq('tenant_id', tenantId)
      .eq('supplier_id', form.supplier_id).in('status', ['sent', 'approved', 'partial'])
      .then(({ data }) => setPos((data as PurchaseOrder[]) ?? []))
  }, [form.supplier_id, tenantId])

  useEffect(() => {
    // In edit mode, items come from the GRN's own saved grn_items (loaded
    // separately above) — don't let re-deriving defaults from the linked PO
    // clobber what was actually recorded as received.
    if (editGRN) return
    if (!form.purchase_order_id) { setPoItems([]); setItems([]); return }
    supabase.from('purchase_order_items').select('*').eq('purchase_order_id', form.purchase_order_id)
      .then(({ data }) => {
        const poItms = (data as PurchaseOrderItem[]) ?? []
        setPoItems(poItms)
        setItems(poItms.map((it) => ({
          product_id: it.product_id ?? '',
          product_name: it.product_name,
          po_item_id: it.id,
          ordered_qty: it.quantity,
          received_qty: it.quantity - it.received_quantity,
          damaged_qty: 0,
          unit_cost: it.unit_price,
          vat_rate: it.vat_rate,
          batch_number: '',
          expiry_date: '',
        })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.purchase_order_id, editGRN])

  function addItem() {
    setItems((prev) => [...prev, {
      product_id: '', product_name: '', po_item_id: '',
      ordered_qty: 0, received_qty: 0, damaged_qty: 0,
      unit_cost: 0, vat_rate: 16, batch_number: '', expiry_date: '',
    }])
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const totalCost = items.reduce((s, it) => s + it.received_qty * it.unit_cost, 0)
  const vatTotal = items.reduce((s, it) => s + it.received_qty * it.unit_cost * it.vat_rate / 100, 0)

  function buildGRNItems(grnId: string) {
    return items.map((it) => ({
      grn_id: grnId,
      tenant_id: tenantId,
      product_id: it.product_id || null,
      po_item_id: it.po_item_id || null,
      product_name: it.product_name,
      ordered_qty: it.ordered_qty,
      received_qty: it.received_qty,
      damaged_qty: it.damaged_qty,
      unit_cost: it.unit_cost,
      vat_rate: it.vat_rate,
      total_cost: it.received_qty * it.unit_cost,
      batch_number: it.batch_number || null,
      expiry_date: it.expiry_date || null,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Select a supplier'); return }
    if (items.length === 0) { toast.error('Add at least one item'); return }
    setLoading(true)

    if (editGRN) {
      const { error: updateError } = await supabase.from('goods_received_notes').update({
        supplier_id: form.supplier_id,
        purchase_order_id: form.purchase_order_id || null,
        supplier_invoice_ref: form.supplier_invoice_ref || null,
        received_date: form.received_date,
        total_cost: totalCost,
        vat_amount: vatTotal,
        notes: form.notes || null,
      }).eq('id', editGRN.id)
      if (updateError) { toast.error(updateError.message); setLoading(false); return }

      const { error: delErr } = await supabase.from('grn_items').delete().eq('grn_id', editGRN.id)
      if (delErr) { toast.error(delErr.message); setLoading(false); return }

      const { error: itemsErr } = await supabase.from('grn_items').insert(buildGRNItems(editGRN.id))
      setLoading(false)
      if (itemsErr) { toast.error(itemsErr.message); return }
      toast.success('GRN updated')
      onSaved()
      return
    }

    const { data: grnNum, error: numErr } = await supabase.rpc('generate_grn_number', { p_tenant_id: tenantId })
    if (numErr) { toast.error(numErr.message); setLoading(false); return }

    const { data: grn, error: grnErr } = await supabase.from('goods_received_notes').insert({
      tenant_id: tenantId,
      supplier_id: form.supplier_id,
      purchase_order_id: form.purchase_order_id || null,
      grn_number: grnNum as string,
      supplier_invoice_ref: form.supplier_invoice_ref || null,
      received_date: form.received_date,
      status: 'draft',
      total_cost: totalCost,
      vat_amount: vatTotal,
      notes: form.notes || null,
    }).select('id').single()

    if (grnErr || !grn) { toast.error(grnErr?.message ?? 'Failed to create GRN'); setLoading(false); return }

    const { error: itemsErr } = await supabase.from('grn_items').insert(buildGRNItems(grn.id))
    setLoading(false)
    if (itemsErr) { toast.error(itemsErr.message); return }
    toast.success('GRN created. Confirm it to update stock.')
    onSaved()
  }

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <ModalShell title={editGRN ? `Edit GRN: ${editGRN.grn_number}` : 'New Goods Received Note'} onClose={onClose} maxW="max-w-3xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Supplier *</label>
            <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value, purchase_order_id: '' }))} className={ic} required>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Linked Purchase Order</label>
            <select value={form.purchase_order_id} onChange={(e) => setForm((f) => ({ ...f, purchase_order_id: e.target.value }))} className={ic}>
              <option value="">None (manual entry)</option>
              {pos.map((po) => <option key={po.id} value={po.id}>{po.po_number}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Supplier Invoice Ref</label>
            <input value={form.supplier_invoice_ref} onChange={(e) => setForm((f) => ({ ...f, supplier_invoice_ref: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Received Date</label>
            <input type="date" value={form.received_date} onChange={(e) => setForm((f) => ({ ...f, received_date: e.target.value }))} className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={ic} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Received Items</p>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              {form.purchase_order_id ? 'PO items will appear here' : 'Add items or link to a PO'}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Product Name</label>
                    <input value={item.product_name} onChange={(e) => updateItem(i, 'product_name', e.target.value)} placeholder="Product"
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Ordered</label>
                    <input type="number" min="0" value={item.ordered_qty} onChange={(e) => updateItem(i, 'ordered_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" readOnly={!!item.po_item_id} />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Received</label>
                    <input type="number" min="0" value={item.received_qty} onChange={(e) => updateItem(i, 'received_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Damaged</label>
                    <input type="number" min="0" value={item.damaged_qty} onChange={(e) => updateItem(i, 'damaged_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Unit Cost</label>
                    <input type="number" min="0" step="0.01" value={item.unit_cost} onChange={(e) => updateItem(i, 'unit_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Batch #</label>
                    <input value={item.batch_number} onChange={(e) => updateItem(i, 'batch_number', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Expiry Date</label>
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(i, 'expiry_date', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none" />
                  </div>
                  {!item.po_item_id && (
                    <div className="col-span-12 flex justify-end">
                      <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-xl text-sm text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Save as draft, then click <strong>Confirm</strong> on the GRN list to update stock levels.
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editGRN ? 'Save Changes' : 'Save GRN Draft'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function GRNDetailModal({ grn, onClose }: { grn: GoodsReceivedNote; onClose: () => void }) {
  const supabase = createClient()
  const branding = useTenantBranding()
  const [items, setItems] = useState<GRNItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('grn_items').select('*').eq('grn_id', grn.id)
      .then(({ data }) => { setItems((data as GRNItem[]) ?? []); setLoading(false) })
  }, [grn.id])

  const sup = grn.supplier as { name?: string; email?: string; phone?: string; address?: string; city?: string } | undefined
  const po = grn.purchase_order as { po_number?: string } | undefined
  const grandTotal = grn.total_cost + grn.vat_amount

  function supplierBlockHtml() {
    return `<div class="mb-6"><p class="text-xs font-bold text-slate-500" style="text-transform:uppercase;margin-bottom:8px">Supplier</p>
      <p class="font-semibold text-slate-800">${sup?.name ?? '—'}</p>
      ${sup?.address ? `<p class="text-slate-500 text-xs">${sup.address}${sup.city ? ', ' + sup.city : ''}</p>` : ''}
      ${sup?.phone ? `<p class="text-slate-500 text-xs">Tel: ${sup.phone}</p>` : ''}
    </div>`
  }

  function itemRowsHtml() {
    return items.map((it) => `<tr>
      <td>${it.product_name}</td>
      <td>${it.ordered_qty}</td>
      <td>${it.received_qty}</td>
      <td>${it.damaged_qty}</td>
      <td>${formatCurrency(it.unit_cost)}</td>
      <td>${formatCurrency(it.total_cost)}</td>
    </tr>`).join('')
  }

  function handlePrint() {
    const headHtml = `<div class="flex justify-between mb-4">
      <div><p class="text-2xl font-bold text-blue-700">${branding?.name ?? 'Store'}</p>
        <div class="text-slate-500 text-xs" style="margin-top:4px">
          ${branding?.address ? `<p>${branding.address}</p>` : ''}
          ${branding?.phone ? `<p>Tel: ${branding.phone}</p>` : ''}
          ${branding?.kraPIN ? `<p>KRA PIN: ${branding.kraPIN}</p>` : ''}
        </div>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-blue-700">GOODS RECEIVED NOTE</p>
        <div class="text-slate-500 text-xs" style="margin-top:8px">
          <p><span class="font-semibold text-slate-800">GRN #:</span> ${grn.grn_number}</p>
          <p><span class="font-semibold text-slate-800">Date:</span> ${new Date(grn.received_date).toLocaleDateString('en-KE')}</p>
          <p><span class="font-semibold text-slate-800">PO Ref:</span> ${po?.po_number ?? '—'}</p>
          <p><span class="font-semibold text-slate-800">Status:</span> ${grn.status}</p>
        </div>
      </div>
    </div>`
    const bodyHtml = `${supplierBlockHtml()}
      <table><thead><tr><th>Product</th><th>Ordered</th><th>Received</th><th>Damaged</th><th>Unit Cost</th><th>Total</th></tr></thead>
      <tbody>${itemRowsHtml()}</tbody></table>
      <div class="totals">
        <div><span class="text-slate-500">Cost</span><span>${formatCurrency(grn.total_cost)}</span></div>
        <div><span class="text-slate-500">VAT</span><span>${formatCurrency(grn.vat_amount)}</span></div>
        <div class="font-bold text-blue-700" style="border-top:1px solid #bfdbfe;padding-top:6px;margin-top:4px"><span>TOTAL</span><span>${formatCurrency(grandTotal)}</span></div>
      </div>
      ${grn.supplier_invoice_ref ? `<p class="text-xs text-slate-500" style="margin-top:16px">Supplier Invoice Ref: ${grn.supplier_invoice_ref}</p>` : ''}
      ${grn.notes ? `<p class="text-xs text-slate-500 mb-2">Notes: ${grn.notes}</p>` : ''}`
    printDocument(`GRN ${grn.grn_number}`, headHtml, bodyHtml)
  }

  function handleDownloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    doc.setFontSize(20); doc.setTextColor(...PDF_BLUE); doc.setFont('helvetica', 'bold')
    doc.text(branding?.name ?? 'Store', 15, 22)
    doc.setFontSize(16); doc.text('GOODS RECEIVED NOTE', 195, 22, { align: 'right' })

    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_GRAY)
    let y = 28
    if (branding?.address) { doc.text(branding.address, 15, y); y += 5 }
    if (branding?.phone) { doc.text(`Tel: ${branding.phone}`, 15, y); y += 5 }
    if (branding?.kraPIN) doc.text(`KRA PIN: ${branding.kraPIN}`, 15, y)
    doc.text(`GRN #: ${grn.grn_number}`, 195, 28, { align: 'right' })
    doc.text(`Date: ${new Date(grn.received_date).toLocaleDateString('en-KE')}`, 195, 33, { align: 'right' })
    doc.text(`PO Ref: ${po?.po_number ?? '—'}`, 195, 38, { align: 'right' })

    doc.setDrawColor(226, 232, 240); doc.line(15, 43, 195, 43)

    doc.setFontSize(8); doc.setTextColor(...PDF_GRAY); doc.setFont('helvetica', 'bold')
    doc.text('SUPPLIER', 15, 50)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...PDF_DARK)
    doc.text(sup?.name ?? '—', 15, 56)
    if (sup?.address) { doc.setFontSize(9); doc.setTextColor(...PDF_GRAY); doc.text(`${sup.address}${sup.city ? ', ' + sup.city : ''}`, 15, 61) }

    autoTable(doc, {
      startY: 68,
      head: [['Product', 'Ordered', 'Received', 'Damaged', 'Unit Cost', 'Total']],
      body: items.map((it) => [it.product_name, String(it.ordered_qty), String(it.received_qty), String(it.damaged_qty), formatCurrency(it.unit_cost), formatCurrency(it.total_cost)]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: PDF_BLUE, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5
    const totalsX = 130
    doc.setFontSize(9); doc.setTextColor(...PDF_GRAY); doc.text('Cost', totalsX, afterTable + 6)
    doc.setTextColor(...PDF_DARK); doc.text(formatCurrency(grn.total_cost), 195, afterTable + 6, { align: 'right' })
    doc.setTextColor(...PDF_GRAY); doc.text('VAT', totalsX, afterTable + 12)
    doc.setTextColor(...PDF_DARK); doc.text(formatCurrency(grn.vat_amount), 195, afterTable + 12, { align: 'right' })
    doc.setDrawColor(...PDF_BLUE); doc.line(totalsX, afterTable + 15, 195, afterTable + 15)
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...PDF_BLUE)
    doc.text('TOTAL', totalsX, afterTable + 21)
    doc.text(formatCurrency(grandTotal), 195, afterTable + 21, { align: 'right' })

    let noteY = afterTable + 32
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...PDF_GRAY)
    if (grn.supplier_invoice_ref) { doc.text(`Supplier Invoice Ref: ${grn.supplier_invoice_ref}`, 15, noteY); noteY += 5 }
    if (grn.notes) doc.text(`Notes: ${grn.notes}`, 15, noteY)

    doc.save(`GRN-${grn.grn_number}.pdf`)
  }

  return (
    <ModalShell title={`GRN: ${grn.grn_number}`} onClose={onClose} maxW="max-w-2xl">
      <div className="p-5 space-y-4">
        <div className="flex justify-end gap-2">
          <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Supplier</p><p className="font-medium text-slate-800 dark:text-white">{sup?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
            <span className={`capitalize font-medium ${grn.status === 'confirmed' ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>{grn.status}</span>
          </div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Received Date</p><p className="text-slate-700 dark:text-slate-200">{new Date(grn.received_date).toLocaleDateString('en-KE')}</p></div>
          <div><p className="text-xs text-slate-500 dark:text-slate-400">Linked PO</p><p className="font-mono text-slate-700 dark:text-slate-200">{po?.po_number ?? '—'}</p></div>
          {grn.supplier_invoice_ref && <div className="col-span-2"><p className="text-xs text-slate-500 dark:text-slate-400">Supplier Invoice Ref</p><p className="text-slate-700 dark:text-slate-200">{grn.supplier_invoice_ref}</p></div>}
        </div>

        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase">
            <th className="text-left px-3 py-2">Product</th>
            <th className="text-right px-3 py-2">Ordered</th>
            <th className="text-right px-3 py-2">Received</th>
            <th className="text-right px-3 py-2">Damaged</th>
            <th className="text-right px-3 py-2">Unit Cost</th>
            <th className="text-right px-3 py-2">Total</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6}><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse m-2" /></td></tr>
            ) : items.map((it) => (
              <tr key={it.id}>
                <td className="px-3 py-2">
                  <p className="text-slate-700 dark:text-slate-200">{it.product_name}</p>
                  {it.batch_number && <p className="text-xs text-slate-400 dark:text-slate-500">Batch: {it.batch_number}</p>}
                </td>
                <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{it.ordered_qty}</td>
                <td className="px-3 py-2 text-right text-green-700 dark:text-green-400 font-semibold">{it.received_qty}</td>
                <td className="px-3 py-2 text-right text-red-600 dark:text-red-400">{it.damaged_qty}</td>
                <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{formatCurrency(it.unit_cost)}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-800 dark:text-white">{formatCurrency(it.total_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Cost</span><span>{formatCurrency(grn.total_cost)}</span></div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>VAT</span><span>{formatCurrency(grn.vat_amount)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1"><span>Total</span><span>{formatCurrency(grn.total_cost + grn.vat_amount)}</span></div>
        </div>
      </div>
    </ModalShell>
  )
}

/* ──────────────────────────────────────────────────────────────
   SHARED MODAL SHELL
────────────────────────────────────────────────────────────── */
function ModalShell({ title, onClose, children, maxW = 'max-w-lg' }: {
  title: string; onClose: () => void; children: React.ReactNode; maxW?: string
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${maxW} my-8`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
          <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
