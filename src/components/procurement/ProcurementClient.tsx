'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Truck, BookOpen, ShoppingBag, PackageCheck,
  Plus, Search, Edit2, X, Loader2, Send, CheckCircle,
  ChevronDown, Trash2, Phone, Mail, Star, AlertTriangle,
  FileText, Package
} from 'lucide-react'
import { useTenantId } from '@/lib/hooks/useTenantId'
import type {
  Supplier, SupplierCatalog, PurchaseOrder,
  PurchaseOrderItem, GoodsReceivedNote, GRNItem, Product
} from '@/types'

type Tab = 'suppliers' | 'catalog' | 'orders' | 'grn'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'catalog',   label: 'Supplier Catalog', icon: BookOpen },
  { id: 'orders',    label: 'Purchase Orders', icon: ShoppingBag },
  { id: 'grn',       label: 'Goods Received', icon: PackageCheck },
]

export default function ProcurementClient() {
  const [tab, setTab] = useState<Tab>('suppliers')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Procurement</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage suppliers, catalogs, purchase orders, and stock receiving</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'suppliers' && <SuppliersTab />}
      {tab === 'catalog'   && <CatalogTab />}
      {tab === 'orders'    && <PurchaseOrdersTab />}
      {tab === 'grn'       && <GRNTab />}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   SUPPLIERS TAB
────────────────────────────────────────────────────────────── */
function SuppliersTab() {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => { setEditSupplier(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">VAT / KRA PIN</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Lead Time</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Balance</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No suppliers yet. Add your first supplier to get started.</p>
              </td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {(s as SupplierExt).is_preferred
                          ? <Star className="w-4 h-4 text-amber-500" />
                          : <Truck className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{s.name}</p>
                        {s.contact_name && <p className="text-xs text-slate-400">{s.contact_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 space-y-0.5">
                    {s.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                    {s.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">
                    {(s as SupplierExt).vat_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    {(s as SupplierExt).lead_time_days ?? 3} days
                  </td>
                  <td className="px-4 py-3 text-center">
                    {(s as SupplierExt).rating
                      ? <span className="text-amber-500 font-semibold text-xs">★ {(s as SupplierExt).rating}</span>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={(s.balance ?? 0) > 0 ? 'text-red-600 font-semibold text-xs' : 'text-slate-400 text-xs'}>
                      {formatCurrency(s.balance ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditSupplier(s); setShowForm(true) }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Suppliers</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => { setEditItem(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier SKU</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Unit Price</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">MOQ</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">VAT</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No catalog items. Add supplier products to build your catalog.</p>
              </td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.product_name}</p>
                    <p className="text-xs text-slate-400">{item.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {(item.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.supplier_sku ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-center text-slate-600 text-xs">{item.moq}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.vat_applicable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.vat_applicable ? 'VAT' : 'No VAT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditItem(item); setShowForm(true) }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
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
function PurchaseOrdersTab() {
  const supabase = createClient()
  const tenantId = useTenantId()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [detailPO, setDetailPO] = useState<PurchaseOrder | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    let q = supabase.from('purchase_orders')
      .select('*, supplier:suppliers(name,email,phone)')
      .eq('tenant_id', tenantId)
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q.order('created_at', { ascending: false }).limit(100)
    setOrders((data as PurchaseOrder[]) ?? [])
    setLoading(false)
  }, [tenantId, statusFilter])

  useEffect(() => { load() }, [load])

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

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {['', 'draft', 'sent', 'approved', 'delivered', 'partial', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-medium transition capitalize ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">PO Number</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Expected Delivery</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No purchase orders yet.</p>
              </td></tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailPO(po)} className="font-mono text-blue-600 hover:underline text-xs font-semibold">
                      {po.po_number}
                    </button>
                    <p className="text-xs text-slate-400">{new Date(po.created_at).toLocaleDateString('en-KE')}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-sm">
                    {(po.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 capitalize">{(po.po_type ?? 'purchase_order').replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[po.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {po.expected_delivery_date
                      ? new Date(po.expected_delivery_date).toLocaleDateString('en-KE')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(po.total_amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {po.status === 'draft' && (
                        <button
                          onClick={() => sendEmail(po)}
                          disabled={sendingId === po.id || !(po.supplier as SupplierWithEmail)?.email}
                          title={(po.supplier as SupplierWithEmail)?.email ? 'Email supplier' : 'Supplier has no email'}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-40"
                        >
                          {sendingId === po.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      )}
                      <button onClick={() => setDetailPO(po)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                        <FileText className="w-4 h-4" />
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
        <CreatePOModal
          tenantId={tenantId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load() }}
        />
      )}
      {detailPO && (
        <PODetailModal po={detailPO} onClose={() => { setDetailPO(null); load() }} />
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
  const [detailGRN, setDetailGRN] = useState<GoodsReceivedNote | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data } = await supabase
      .from('goods_received_notes')
      .select('*, supplier:suppliers(name), purchase_order:purchase_orders(po_number)')
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

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    confirmed: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> New GRN
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">GRN Number</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Linked PO</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Received Date</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total Cost</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : grns.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                <PackageCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No goods received notes yet.</p>
              </td></tr>
            ) : (
              grns.map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-slate-700">{grn.grn_number}</p>
                    {grn.supplier_invoice_ref && <p className="text-xs text-slate-400">Inv: {grn.supplier_invoice_ref}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-sm">
                    {(grn.supplier as { name: string } | undefined)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-blue-600">
                    {(grn.purchase_order as { po_number: string } | undefined)?.po_number ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {new Date(grn.received_date).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[grn.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {grn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(grn.total_cost)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailGRN(grn)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                        <FileText className="w-4 h-4" />
                      </button>
                      {grn.status === 'draft' && (
                        <button
                          onClick={() => confirmGRN(grn.id)}
                          disabled={confirming === grn.id}
                          title="Confirm & update stock"
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-40"
                        >
                          {confirming === grn.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
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

      {showCreate && tenantId && (
        <CreateGRNModal
          tenantId={tenantId}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load() }}
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

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

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
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
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
              <span className="text-sm text-slate-700">Mark as Preferred Supplier</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm">Cancel</button>
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
  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

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
          <label className="block text-xs font-medium text-slate-600 mb-1">Supplier *</label>
          <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))} className={ic} required>
            <option value="">Select supplier…</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Linked Product (optional)</label>
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
            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
            <input required={required} type={type ?? 'text'}
              value={form[key as keyof typeof form] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className={ic} />
          </div>
        ))}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input type="checkbox" checked={form.vat_applicable}
              onChange={(e) => setForm((f) => ({ ...f, vat_applicable: e.target.checked }))} className="rounded" />
            VAT Applicable
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input type="checkbox" checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} className="rounded" />
            Available
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Save' : 'Add Item'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function CreatePOModal({ tenantId, onClose, onSaved }: {
  tenantId: string; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [catalog, setCatalog] = useState<SupplierCatalog[]>([])
  const [form, setForm] = useState({
    supplier_id: '',
    po_type: 'purchase_order' as POType,
    expected_delivery_date: '',
    notes: '',
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Select a supplier'); return }
    if (items.length === 0) { toast.error('Add at least one item'); return }
    setLoading(true)
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

    const poItems = items.map((it) => {
      const lineTotal = it.quantity * it.unit_price * (1 + it.vat_rate / 100)
      return {
        po_id: po.id,
        purchase_order_id: po.id,
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
    const { error: itemsError } = await supabase.from('purchase_order_items').insert(poItems)
    setLoading(false)
    if (itemsError) { toast.error(itemsError.message); return }
    toast.success('Purchase order created')
    onSaved()
  }

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <ModalShell title="New Purchase Order" onClose={onClose} maxW="max-w-3xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Supplier *</label>
            <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value }))} className={ic} required>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Order Type</label>
            <select value={form.po_type} onChange={(e) => setForm((f) => ({ ...f, po_type: e.target.value as POType }))} className={ic}>
              <option value="purchase_order">Purchase Order</option>
              <option value="purchase_request">Purchase Request</option>
              <option value="rfq">Request for Quotation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Expected Delivery Date</label>
            <input type="date" value={form.expected_delivery_date} onChange={(e) => setForm((f) => ({ ...f, expected_delivery_date: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Default VAT Rate (%)</label>
            <input type="number" min="0" max="100" value={form.vat_rate}
              onChange={(e) => setForm((f) => ({ ...f, vat_rate: parseFloat(e.target.value) || 0 }))} className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={ic} />
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Order Items</p>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Click &quot;Add Item&quot; to add products to this order
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs text-slate-500 mb-1">Product</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs text-slate-500 mb-1">Name</label>
                    <input value={item.product_name} onChange={(e) => updateItem(i, 'product_name', e.target.value)}
                      placeholder="Product name" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Unit Price</label>
                    <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">VAT%</label>
                    <input type="number" min="0" max="100" value={item.vat_rate} onChange={(e) => updateItem(i, 'vat_rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1 flex flex-col items-end">
                    <span className="text-xs text-slate-500 mb-1">&nbsp;</span>
                    <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition">
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
          <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-slate-600"><span>VAT</span><span>{formatCurrency(vatTotal)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Purchase Order
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

type POType = 'purchase_request' | 'rfq' | 'purchase_order'

function PODetailModal({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
  const supabase = createClient()
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    supabase.from('purchase_order_items').select('*').eq('purchase_order_id', po.id)
      .then(({ data }) => { setItems((data as PurchaseOrderItem[]) ?? []); setLoading(false) })
  }, [po.id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', po.id)
    setUpdating(false)
    if (error) toast.error(error.message)
    else { toast.success(`Status updated to ${status}`); onClose() }
  }

  const sup = po.supplier as { name?: string; email?: string; phone?: string } | undefined

  return (
    <ModalShell title={`Purchase Order: ${po.po_number}`} onClose={onClose} maxW="max-w-2xl">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-500">Supplier</p><p className="font-medium">{sup?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Status</p>
            <span className="capitalize font-medium">{po.status}</span>
          </div>
          <div><p className="text-xs text-slate-500">Type</p><p className="capitalize">{po.po_type?.replace('_', ' ') ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Expected Delivery</p>
            <p>{po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-KE') : '—'}</p>
          </div>
          {po.notes && <div className="col-span-2"><p className="text-xs text-slate-500">Notes</p><p>{po.notes}</p></div>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
              <th className="text-left px-3 py-2">Product</th>
              <th className="text-right px-3 py-2">Qty</th>
              <th className="text-right px-3 py-2">Unit Price</th>
              <th className="text-right px-3 py-2">VAT</th>
              <th className="text-right px-3 py-2">Total</th>
              <th className="text-right px-3 py-2">Received</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6}><div className="h-8 bg-slate-100 rounded animate-pulse m-2" /></td></tr>
              ) : items.map((it) => (
                <tr key={it.id}>
                  <td className="px-3 py-2">{it.product_name}</td>
                  <td className="px-3 py-2 text-right">{it.quantity} {it.unit}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(it.unit_price)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(it.vat_amount)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(it.total)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={it.received_quantity >= it.quantity ? 'text-green-600' : 'text-amber-600'}>
                      {it.received_quantity}/{it.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(po.subtotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>VAT</span><span>{formatCurrency(po.vat_amount)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1"><span>Total</span><span>{formatCurrency(po.total_amount)}</span></div>
        </div>

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
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition">
              Cancel PO
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function CreateGRNModal({ tenantId, onClose, onSaved }: {
  tenantId: string; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([])
  const [form, setForm] = useState({
    supplier_id: '', purchase_order_id: '', supplier_invoice_ref: '',
    received_date: new Date().toISOString().slice(0, 10), notes: '',
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
    if (!form.supplier_id) { setPos([]); return }
    supabase.from('purchase_orders').select('id,po_number').eq('tenant_id', tenantId)
      .eq('supplier_id', form.supplier_id).in('status', ['sent', 'approved', 'partial'])
      .then(({ data }) => setPos((data as PurchaseOrder[]) ?? []))
  }, [form.supplier_id, tenantId])

  useEffect(() => {
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
  }, [form.purchase_order_id])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier_id) { toast.error('Select a supplier'); return }
    if (items.length === 0) { toast.error('Add at least one item'); return }
    setLoading(true)
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

    const grnItems = items.map((it) => ({
      grn_id: grn.id,
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
    const { error: itemsErr } = await supabase.from('grn_items').insert(grnItems)
    setLoading(false)
    if (itemsErr) { toast.error(itemsErr.message); return }
    toast.success('GRN created. Confirm it to update stock.')
    onSaved()
  }

  const ic = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <ModalShell title="New Goods Received Note" onClose={onClose} maxW="max-w-3xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Supplier *</label>
            <select value={form.supplier_id} onChange={(e) => setForm((f) => ({ ...f, supplier_id: e.target.value, purchase_order_id: '' }))} className={ic} required>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Purchase Order</label>
            <select value={form.purchase_order_id} onChange={(e) => setForm((f) => ({ ...f, purchase_order_id: e.target.value }))} className={ic}>
              <option value="">None (manual entry)</option>
              {pos.map((po) => <option key={po.id} value={po.id}>{po.po_number}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Supplier Invoice Ref</label>
            <input value={form.supplier_invoice_ref} onChange={(e) => setForm((f) => ({ ...f, supplier_invoice_ref: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Received Date</label>
            <input type="date" value={form.received_date} onChange={(e) => setForm((f) => ({ ...f, received_date: e.target.value }))} className={ic} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className={ic} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Received Items</p>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          {items.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
              {form.purchase_order_id ? 'PO items will appear here' : 'Add items or link to a PO'}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-500 mb-1">Product Name</label>
                    <input value={item.product_name} onChange={(e) => updateItem(i, 'product_name', e.target.value)} placeholder="Product"
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Ordered</label>
                    <input type="number" min="0" value={item.ordered_qty} onChange={(e) => updateItem(i, 'ordered_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none" readOnly={!!item.po_item_id} />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Received</label>
                    <input type="number" min="0" value={item.received_qty} onChange={(e) => updateItem(i, 'received_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Damaged</label>
                    <input type="number" min="0" value={item.damaged_qty} onChange={(e) => updateItem(i, 'damaged_qty', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Unit Cost</label>
                    <input type="number" min="0" step="0.01" value={item.unit_cost} onChange={(e) => updateItem(i, 'unit_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Batch #</label>
                    <input value={item.batch_number} onChange={(e) => updateItem(i, 'batch_number', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Expiry Date</label>
                    <input type="date" value={item.expiry_date} onChange={(e) => updateItem(i, 'expiry_date', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none" />
                  </div>
                  {!item.po_item_id && (
                    <div className="col-span-12 flex justify-end">
                      <button type="button" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 hover:text-red-700 transition">Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Save as draft, then click <strong>Confirm</strong> on the GRN list to update stock levels.
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save GRN Draft
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function GRNDetailModal({ grn, onClose }: { grn: GoodsReceivedNote; onClose: () => void }) {
  const supabase = createClient()
  const [items, setItems] = useState<GRNItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('grn_items').select('*').eq('grn_id', grn.id)
      .then(({ data }) => { setItems((data as GRNItem[]) ?? []); setLoading(false) })
  }, [grn.id])

  const sup = grn.supplier as { name?: string } | undefined
  const po = grn.purchase_order as { po_number?: string } | undefined

  return (
    <ModalShell title={`GRN: ${grn.grn_number}`} onClose={onClose} maxW="max-w-2xl">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-500">Supplier</p><p className="font-medium">{sup?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-500">Status</p>
            <span className={`capitalize font-medium ${grn.status === 'confirmed' ? 'text-green-700' : 'text-amber-700'}`}>{grn.status}</span>
          </div>
          <div><p className="text-xs text-slate-500">Received Date</p><p>{new Date(grn.received_date).toLocaleDateString('en-KE')}</p></div>
          <div><p className="text-xs text-slate-500">Linked PO</p><p className="font-mono">{po?.po_number ?? '—'}</p></div>
          {grn.supplier_invoice_ref && <div className="col-span-2"><p className="text-xs text-slate-500">Supplier Invoice Ref</p><p>{grn.supplier_invoice_ref}</p></div>}
        </div>

        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
            <th className="text-left px-3 py-2">Product</th>
            <th className="text-right px-3 py-2">Ordered</th>
            <th className="text-right px-3 py-2">Received</th>
            <th className="text-right px-3 py-2">Damaged</th>
            <th className="text-right px-3 py-2">Unit Cost</th>
            <th className="text-right px-3 py-2">Total</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6}><div className="h-8 bg-slate-100 rounded animate-pulse m-2" /></td></tr>
            ) : items.map((it) => (
              <tr key={it.id}>
                <td className="px-3 py-2">
                  <p>{it.product_name}</p>
                  {it.batch_number && <p className="text-xs text-slate-400">Batch: {it.batch_number}</p>}
                </td>
                <td className="px-3 py-2 text-right">{it.ordered_qty}</td>
                <td className="px-3 py-2 text-right text-green-700 font-semibold">{it.received_qty}</td>
                <td className="px-3 py-2 text-right text-red-600">{it.damaged_qty}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(it.unit_cost)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(it.total_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600"><span>Cost</span><span>{formatCurrency(grn.total_cost)}</span></div>
          <div className="flex justify-between text-slate-600"><span>VAT</span><span>{formatCurrency(grn.vat_amount)}</span></div>
          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1"><span>Total</span><span>{formatCurrency(grn.total_cost + grn.vat_amount)}</span></div>
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
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} my-8`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
