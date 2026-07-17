'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CheckCircle, XCircle, Plus, Loader2, X } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  provider_reference: string | null
  proof_url: string | null
  created_at: string
  tenant: { name: string; subdomain: string } | null
}

interface Props {
  payments: Payment[]
  tenants: { id: string; name: string }[]
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function PaymentsClient({ payments, tenants }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)

  async function approve(id: string) {
    setBusyId(id)
    const res = await fetch('/api/admin/billing/approve-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
    const body = await res.json()
    setBusyId(null)
    if (!res.ok) { toast.error(body.message); return }
    toast.success('Payment approved — subscription renewed')
    router.refresh()
  }

  async function reject(id: string) {
    if (!confirm('Reject this payment?')) return
    setBusyId(id)
    const res = await fetch('/api/admin/billing/reject-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
    const body = await res.json()
    setBusyId(null)
    if (!res.ok) { toast.error(body.message); return }
    toast.success('Payment rejected')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">{payments.length} recent payments across all rails</p>
        </div>
        <button onClick={() => setShowManual(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Record Manual Payment
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.tenant?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.method.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.provider_reference ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(p.created_at)}</td>
                <td className="px-4 py-3">
                  {p.status === 'pending' && (p.method === 'bank_transfer' || p.method === 'manual') && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => approve(p.id)} disabled={busyId === p.id}
                        className="flex items-center gap-1 text-green-600 text-xs font-medium hover:underline disabled:opacity-50">
                        {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button onClick={() => reject(p.id)} disabled={busyId === p.id}
                        className="flex items-center gap-1 text-red-600 text-xs font-medium hover:underline disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div className="text-center py-12 text-gray-400">No payments yet</div>}
      </div>

      {showManual && <ManualPaymentModal tenants={tenants} onClose={() => setShowManual(false)} onSaved={() => { setShowManual(false); router.refresh() }} />}
    </div>
  )
}

function ManualPaymentModal({ tenants, onClose, onSaved }: { tenants: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [tenantId, setTenantId] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!tenantId || !amount || Number(amount) <= 0) { toast.error('Choose a tenant and enter a valid amount'); return }
    setSaving(true)
    const res = await fetch('/api/admin/billing/record-manual-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, amount: Number(amount), notes }),
    })
    const body = await res.json()
    setSaving(false)
    if (!res.ok) { toast.error(body.message); return }
    toast.success('Payment recorded — subscription renewed')
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-800">Record Manual Payment</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tenant</label>
            <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select tenant...</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (KES)</label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Cash paid at office"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={submit} disabled={saving}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Payment
          </button>
        </div>
      </div>
    </div>
  )
}
