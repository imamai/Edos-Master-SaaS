'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Tenant } from '@/types'

interface Plan { id: string; name: string; slug: string }

interface Props {
  tenant: Tenant
}

const statusOptions = [
  { value: 'active', label: 'Activate' },
  { value: 'grace_period', label: 'Set Grace Period (7 days)' },
  { value: 'suspended', label: 'Suspend' },
  { value: 'cancelled', label: 'Cancel' },
]

export default function TenantActions({ tenant }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [changingPlan, setChangingPlan] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('plans')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          const planList = data as Plan[]
          setPlans(planList)
          const tenantPlan = tenant.plan as { id: string } | null
          setSelectedPlanId(tenantPlan?.id ?? planList[0]?.id ?? '')
        }
      })
  }, [tenant])

  const updateStatus = async (status: string) => {
    if (!confirm(`Change tenant status to "${status}"?`)) return
    setLoading(true)
    const res = await fetch(`/api/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(`Status updated to ${status}`)
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  const changePlan = async () => {
    if (!selectedPlanId) return
    if (!confirm('Update this tenant\'s plan?')) return
    setChangingPlan(true)
    const res = await fetch(`/api/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: selectedPlanId }),
    })
    setChangingPlan(false)
    if (res.ok) {
      toast.success('Plan updated')
      router.refresh()
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${tenant.name}"? This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/tenants/${tenant.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      toast.success('Tenant deleted')
      router.push('/admin/tenants')
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Status actions */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Status Actions</h2>
        <div className="space-y-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              disabled={loading || tenant.status === opt.value}
              className="w-full text-left px-3 py-2 rounded-lg text-sm border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan assignment */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Assign Plan</h2>
        <select
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={changePlan}
          disabled={changingPlan}
          className="w-full px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {changingPlan ? 'Saving…' : 'Update Plan'}
        </button>
      </div>

      {/* Links & danger */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-2">
          <a
            href={`https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm border text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Open Tenant App ↗
          </a>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full text-left px-3 py-2 rounded-lg text-sm border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Delete Tenant
          </button>
        </div>
      </div>
    </div>
  )
}
