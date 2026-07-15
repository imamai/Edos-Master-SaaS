'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getPlanPrice } from '@/lib/utils'
import type { Tenant, Plan, Profile, Branch } from '@/types'
import {
  CheckCircle, Loader2, CreditCard, Upload, ImageIcon,
  UserPlus, X, Pencil, Check, Power, Tag, Plus, Palette,
} from 'lucide-react'

const tenantSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  kra_pin: z.string().optional(),
  receipt_header: z.string().optional(),
  receipt_footer: z.string().optional(),
  payment_instructions: z.string().optional(),
  quotation_notes: z.string().optional(),
  invoice_terms: z.string().optional(),
  tax_enabled: z.boolean().default(false),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
  tax_name: z.string().optional(),
  primary_color: z.string(),
})

type TenantForm = z.infer<typeof tenantSchema>

interface Props {
  tenant: Tenant
  plans: Plan[]
  staff: Profile[]
  branches: Branch[]
  currentUserId: string
  currentUserRole: string
}

interface Category { id: string; name: string; color: string; is_active: boolean }

const ROLES = ['cashier', 'staff', 'manager', 'owner'] as const

const tabs = ['Business', 'Categories', 'Staff', 'Billing', 'Branches', 'M-Pesa']

export default function SettingsClient({ tenant, plans, staff: initialStaff, branches, currentUserId, currentUserRole }: Props) {
  const [activeTab, setActiveTab] = useState('Business')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semiannual' | 'yearly'>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const supabase = createClient()

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url)
  const [logoUploading, setLogoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3B82F6')
  const [savingCat, setSavingCat] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatColor, setEditCatColor] = useState('')

  // Staff state
  const [staff, setStaff] = useState<Profile[]>(initialStaff)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('cashier')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [updatingStaff, setUpdatingStaff] = useState<string | null>(null)

  const canManageStaff = ['owner', 'manager', 'super_admin'].includes(currentUserRole)
  const canManageMpesa = ['owner', 'manager', 'super_admin'].includes(currentUserRole)

  // M-Pesa settings state
  const [mpesaLoading, setMpesaLoading] = useState(false)
  const [mpesaSaving, setMpesaSaving] = useState(false)
  const [mpesaSettings, setMpesaSettings] = useState<{
    environment: 'sandbox' | 'production'
    consumer_key: string
    consumer_secret: string
    shortcode: string
    passkey: string
    initiator_name: string
    security_credential: string
    is_active: boolean
  }>({
    environment: 'sandbox',
    consumer_key: '',
    consumer_secret: '',
    shortcode: '',
    passkey: '',
    initiator_name: '',
    security_credential: '',
    is_active: true,
  })
  const [mpesaLoaded, setMpesaLoaded] = useState(false)
  const [showMpesaSecrets, setShowMpesaSecrets] = useState(false)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      phone: tenant.phone || '',
      address: (tenant.metadata?.address as string) || '',
      kra_pin: (tenant.metadata?.kra_pin as string) || '',
      receipt_header: tenant.receipt_header || '',
      receipt_footer: tenant.receipt_footer || '',
      payment_instructions: (tenant.metadata?.payment_instructions as string) || '',
      quotation_notes: (tenant.metadata?.quotation_notes as string) || '',
      invoice_terms: (tenant.metadata?.invoice_terms as string) || '',
      tax_enabled: tenant.tax_enabled,
      tax_rate: tenant.tax_rate,
      tax_name: tenant.tax_name || 'VAT',
      primary_color: tenant.primary_color,
    },
  })

  useEffect(() => {
    if (activeTab === 'Categories') loadCategories()
    if (activeTab === 'M-Pesa' && !mpesaLoaded) loadMpesaSettings()
  }, [activeTab])

  async function loadMpesaSettings() {
    setMpesaLoading(true)
    try {
      const res = await fetch('/api/mpesa/settings')
      const json = await res.json()
      if (json.settings) {
        setMpesaSettings({
          environment: json.settings.environment ?? 'sandbox',
          consumer_key: json.settings.consumer_key ?? '',
          consumer_secret: json.settings.consumer_secret ?? '',
          shortcode: json.settings.shortcode ?? '',
          passkey: json.settings.passkey ?? '',
          initiator_name: json.settings.initiator_name ?? '',
          security_credential: json.settings.security_credential ?? '',
          is_active: json.settings.is_active ?? true,
        })
      }
      setMpesaLoaded(true)
    } catch {
      toast.error('Failed to load M-Pesa settings')
    } finally {
      setMpesaLoading(false)
    }
  }

  async function saveMpesaSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!canManageMpesa) return
    setMpesaSaving(true)
    try {
      const res = await fetch('/api/mpesa/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mpesaSettings),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Save failed')
      toast.success('M-Pesa settings saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setMpesaSaving(false)
    }
  }

  async function loadCategories() {
    setCatsLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('id, name, color, is_active')
      .eq('tenant_id', tenant.id)
      .order('name')
    setCategories((data ?? []) as Category[])
    setCatsLoading(false)
  }

  // ── Logo upload ──────────────────────────────────────────
  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2 MB'); return }

    setLogoUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${tenant.id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (uploadError) { toast.error(uploadError.message); setLogoUploading(false); return }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    const logoUrl = urlData.publicUrl

    const { error: updateError } = await supabase.from('tenants').update({ logo_url: logoUrl }).eq('id', tenant.id)
    if (updateError) { toast.error(updateError.message) } else {
      setLogoPreview(logoUrl)
      toast.success('Logo updated!')
    }
    setLogoUploading(false)
  }

  async function handleRemoveLogo() {
    const { error } = await supabase.from('tenants').update({ logo_url: null }).eq('id', tenant.id)
    if (error) { toast.error(error.message) } else {
      setLogoPreview(null)
      toast.success('Logo removed')
    }
  }

  // ── Business save ────────────────────────────────────────
  const onSaveBusiness = async (data: TenantForm) => {
    const { address, kra_pin, payment_instructions, quotation_notes, invoice_terms, ...directFields } = data
    const metadata = {
      ...(tenant.metadata ?? {}),
      address: address || '',
      kra_pin: kra_pin || '',
      payment_instructions: payment_instructions || '',
      quotation_notes: quotation_notes || '',
      invoice_terms: invoice_terms || '',
    }
    const { error } = await supabase.from('tenants').update({
      ...directFields,
      phone: directFields.phone || null,
      metadata,
    }).eq('id', tenant.id)
    if (error) toast.error(error.message)
    else toast.success('Settings saved!')
  }

  // ── Billing ──────────────────────────────────────────────
  const handleSubscribe = async (plan: Plan) => {
    const priceId =
      billingCycle === 'yearly' ? plan.stripe_yearly_price_id :
      billingCycle === 'semiannual' ? plan.stripe_semiannual_price_id :
      plan.stripe_monthly_price_id

    if (!priceId) { toast.error('Stripe price not configured. Contact support.'); return }

    setCheckoutLoading(plan.id)
    const res = await fetch('/api/billing/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, billingCycle }),
    })
    setCheckoutLoading(null)
    if (res.ok) { const { url } = await res.json(); window.location.href = url }
    else { const err = await res.json(); toast.error(err.message) }
  }

  // ── Categories CRUD ──────────────────────────────────────
  async function addCategory() {
    if (!newCatName.trim()) return
    setSavingCat(true)
    const { data, error } = await supabase
      .from('categories')
      .insert({ tenant_id: tenant.id, name: newCatName.trim(), color: newCatColor, is_active: true })
      .select('id, name, color, is_active')
      .single()
    if (error) { toast.error(error.message) } else {
      setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCatName('')
      setNewCatColor('#3B82F6')
      setShowAddCat(false)
      toast.success('Category added')
    }
    setSavingCat(false)
  }

  async function saveEditCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .update({ name: editCatName.trim(), color: editCatColor })
      .eq('id', id)
    if (error) { toast.error(error.message); return }
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: editCatName.trim(), color: editCatColor } : c))
    setEditingCatId(null)
    toast.success('Category updated')
  }

  async function toggleCategory(id: string, current: boolean) {
    const { error } = await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c))
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? Products in it will become uncategorised.')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    toast.success('Category deleted')
  }

  // ── Staff management ─────────────────────────────────────
  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    const res = await fetch('/api/staff/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, tenantId: tenant.id }),
    })
    const body = await res.json()
    if (!res.ok) { toast.error(body.message) }
    else {
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('cashier')
      setShowInvite(false)
    }
    setInviteLoading(false)
  }

  async function updateStaffRole(profileId: string, role: string) {
    setUpdatingStaff(profileId)
    const res = await fetch('/api/staff/invite', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, role, tenantId: tenant.id }),
    })
    const body = await res.json()
    if (!res.ok) { toast.error(body.message) }
    else { setStaff((prev) => prev.map((p) => p.id === profileId ? { ...p, role: role as Profile['role'] } : p)) }
    setUpdatingStaff(null)
  }

  async function toggleStaffActive(profileId: string, current: boolean) {
    if (profileId === currentUserId) { toast.error('Cannot deactivate yourself'); return }
    setUpdatingStaff(profileId)
    const res = await fetch('/api/staff/invite', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, is_active: !current, tenantId: tenant.id }),
    })
    const body = await res.json()
    if (!res.ok) { toast.error(body.message) }
    else { setStaff((prev) => prev.map((p) => p.id === profileId ? { ...p, is_active: !current } : p)) }
    setUpdatingStaff(null)
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Business ── */}
      {activeTab === 'Business' && (
        <form onSubmit={handleSubmit(onSaveBusiness)} className="space-y-5 max-w-lg">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {logoUploading ? 'Uploading…' : 'Upload Logo'}
                </button>
                {logoPreview && (
                  <button type="button" onClick={handleRemoveLogo}
                    className="text-xs text-red-500 hover:underline text-left">
                    Remove logo
                  </button>
                )}
                <p className="text-xs text-gray-400">PNG/JPG, max 2 MB</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input {...register('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <textarea {...register('address')} rows={2} placeholder="Street, City, Country"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">Shown on receipts, invoices and quotations.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN</label>
            <input {...register('kra_pin')} placeholder="e.g. P051234567A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Kenya Revenue Authority PIN — shown on tax invoices and quotations.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input {...register('primary_color')} type="color" className="w-10 h-10 rounded cursor-pointer border" />
              <input {...register('primary_color')} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="#2563EB" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Header</label>
            <textarea {...register('receipt_header')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer</label>
            <textarea {...register('receipt_footer')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="border rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Document Notes & Terms</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Instructions</label>
              <textarea {...register('payment_instructions')} rows={2}
                placeholder="e.g. Bank: KCB, Account: 1234567890, M-Pesa Till: 123456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <p className="text-xs text-gray-400 mt-1">Shown on invoices for customer payment reference.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quotation Notes</label>
              <textarea {...register('quotation_notes')} rows={2}
                placeholder="e.g. Prices valid for 14 days. Subject to stock availability."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Terms & Conditions</label>
              <textarea {...register('invoice_terms')} rows={2}
                placeholder="e.g. Goods once sold are not returnable without invoice within 7 days."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input {...register('tax_enabled')} type="checkbox" id="tax" className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="tax" className="text-sm font-medium text-gray-700">Enable Tax</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tax Name</label>
                <input {...register('tax_name')} placeholder="VAT" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
                <input {...register('tax_rate')} type="number" min="0" max="100" step="0.1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      )}

      {/* ── Categories ── */}
      {activeTab === 'Categories' && (
        <div className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Product Categories</h2>
              <p className="text-xs text-gray-500">Organise your inventory into categories</p>
            </div>
            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {showAddCat && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-blue-800">New Category</p>
              <div className="flex gap-3">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                />
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-9 h-9 rounded border cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addCategory} disabled={savingCat || !newCatName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {savingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => { setShowAddCat(false); setNewCatName(''); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {catsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No categories yet. Add your first one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {editingCatId === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && saveEditCategory(cat.id)}
                        autoFocus
                      />
                      <input type="color" value={editCatColor} onChange={(e) => setEditCatColor(e.target.value)}
                        className="w-8 h-8 rounded border cursor-pointer" />
                      <button onClick={() => saveEditCategory(cat.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingCatId(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm font-medium ${cat.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {cat.name}
                      </span>
                      {!cat.is_active && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                      <button onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); setEditCatColor(cat.color) }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleCategory(cat.id, cat.is_active)}
                        className={`p-1.5 rounded-lg transition ${cat.is_active ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={cat.is_active ? 'Deactivate' : 'Activate'}>
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Staff ── */}
      {activeTab === 'Staff' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Staff Members</h2>
              <p className="text-xs text-gray-500">{staff.length} member{staff.length !== 1 ? 's' : ''}</p>
            </div>
            {canManageStaff && (
              <button onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <UserPlus className="w-4 h-4" /> Invite Staff
              </button>
            )}
          </div>

          {showInvite && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-blue-800">Invite a team member</p>
              <div className="flex gap-3">
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="Email address"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleInvite} disabled={inviteLoading || !inviteEmail.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {inviteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Send Invite
                </button>
                <button onClick={() => { setShowInvite(false); setInviteEmail('') }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500">The user will receive an email to set up their account and join your store.</p>
            </div>
          )}

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {canManageStaff && <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((p) => {
                  const isSelf = p.id === currentUserId
                  const isUpdating = updatingStaff === p.id
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{p.full_name || p.email}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {canManageStaff && !isSelf ? (
                          <select
                            value={p.role}
                            onChange={(e) => updateStaffRole(p.id, e.target.value)}
                            disabled={isUpdating}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 capitalize focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{p.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManageStaff && (
                        <td className="px-4 py-3">
                          {!isSelf && (
                            <button
                              onClick={() => toggleStaffActive(p.id, p.is_active)}
                              disabled={isUpdating}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition disabled:opacity-40 ${
                                p.is_active
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                              {p.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Billing ── */}
      {activeTab === 'Billing' && (
        <div>
          <div className="flex gap-2 mb-6">
            {(['monthly', 'semiannual', 'yearly'] as const).map((cycle) => (
              <button key={cycle} onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === cycle ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'yearly' && <span className="ml-1 text-xs opacity-75">Save 17%</span>}
                {cycle === 'semiannual' && <span className="ml-1 text-xs opacity-75">Save 10%</span>}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const price = getPlanPrice(plan, billingCycle)
              const isCurrent = tenant.plan_id === plan.id
              return (
                <div key={plan.id} className={`border-2 rounded-xl p-5 ${isCurrent ? 'border-blue-600' : 'border-gray-200'}`}>
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mb-2">
                      <CheckCircle className="w-3.5 h-3.5" /> Current Plan
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(price)}</p>
                  <p className="text-xs text-gray-500">/{billingCycle === 'monthly' ? 'month' : billingCycle === 'semiannual' ? '6 months' : 'year'}</p>
                  <ul className="mt-4 space-y-1.5">
                    {(plan.features as string[]).slice(0, 5).map((f) => (
                      <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button onClick={() => handleSubscribe(plan)} disabled={checkoutLoading === plan.id}
                      className="w-full mt-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2">
                      {checkoutLoading === plan.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <CreditCard className="w-3.5 h-3.5" />
                      Subscribe
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Branches ── */}
      {activeTab === 'Branches' && (
        <div className="space-y-3 max-w-lg">
          {branches.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{b.name}</p>
                  {b.address && <p className="text-sm text-gray-500">{[b.city, b.address].filter(Boolean).join(', ')}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {b.is_main && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Main</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'M-Pesa' && (
        <div className="max-w-lg space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-medium">Safaricom Daraja API Credentials</p>
            <p className="text-xs text-green-700 mt-1">
              Enter your own M-Pesa Daraja app credentials. Each account uses its own shortcode and keys.
              Get credentials at <span className="font-mono">developer.safaricom.co.ke</span>.
            </p>
          </div>

          {mpesaLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
            </div>
          ) : (
            <form onSubmit={saveMpesaSettings} className="space-y-5">
              {/* Environment toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <div className="flex gap-3">
                  {(['sandbox', 'production'] as const).map((env) => (
                    <label key={env} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="environment"
                        value={env}
                        checked={mpesaSettings.environment === env}
                        onChange={() => setMpesaSettings(s => ({ ...s, environment: env }))}
                        disabled={!canManageMpesa}
                        className="accent-green-600"
                      />
                      <span className={`text-sm capitalize ${env === 'production' ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                        {env}
                      </span>
                    </label>
                  ))}
                </div>
                {mpesaSettings.environment === 'production' && (
                  <p className="text-xs text-amber-600 mt-1">Live environment — real money transactions will occur.</p>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between bg-white border rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable M-Pesa</p>
                  <p className="text-xs text-gray-500">Allow M-Pesa as a payment method at the POS</p>
                </div>
                <button
                  type="button"
                  onClick={() => canManageMpesa && setMpesaSettings(s => ({ ...s, is_active: !s.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mpesaSettings.is_active ? 'bg-green-600' : 'bg-gray-300'} ${!canManageMpesa ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${mpesaSettings.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Credentials */}
              <div className="bg-white border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">API Credentials</p>
                  <button
                    type="button"
                    onClick={() => setShowMpesaSecrets(v => !v)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showMpesaSecrets ? 'Hide' : 'Show'} secrets
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Consumer Key</label>
                    <input
                      type={showMpesaSecrets ? 'text' : 'password'}
                      value={mpesaSettings.consumer_key}
                      onChange={e => setMpesaSettings(s => ({ ...s, consumer_key: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="Daraja app consumer key"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Consumer Secret</label>
                    <input
                      type={showMpesaSecrets ? 'text' : 'password'}
                      value={mpesaSettings.consumer_secret}
                      onChange={e => setMpesaSettings(s => ({ ...s, consumer_secret: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="Daraja app consumer secret"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Business Shortcode</label>
                    <input
                      type="text"
                      value={mpesaSettings.shortcode}
                      onChange={e => setMpesaSettings(s => ({ ...s, shortcode: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="e.g. 174379"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Passkey (Lipa Na M-Pesa)</label>
                    <input
                      type={showMpesaSecrets ? 'text' : 'password'}
                      value={mpesaSettings.passkey}
                      onChange={e => setMpesaSettings(s => ({ ...s, passkey: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="STK Push passkey"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Optional B2C / Refund fields */}
              <details className="bg-white border rounded-xl">
                <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
                  B2C / Refund credentials (optional)
                </summary>
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Initiator Name</label>
                    <input
                      type="text"
                      value={mpesaSettings.initiator_name}
                      onChange={e => setMpesaSettings(s => ({ ...s, initiator_name: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="B2C initiator name"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Security Credential</label>
                    <input
                      type={showMpesaSecrets ? 'text' : 'password'}
                      value={mpesaSettings.security_credential}
                      onChange={e => setMpesaSettings(s => ({ ...s, security_credential: e.target.value }))}
                      disabled={!canManageMpesa}
                      placeholder="Encrypted security credential"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </details>

              {canManageMpesa ? (
                <button
                  type="submit"
                  disabled={mpesaSaving}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {mpesaSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {mpesaSaving ? 'Saving…' : 'Save M-Pesa Settings'}
                </button>
              ) : (
                <p className="text-xs text-gray-500">Only owners and managers can update M-Pesa settings.</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
