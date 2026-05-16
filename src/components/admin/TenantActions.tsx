'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Tenant } from '@/types'

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

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${tenant.name}"? This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/tenants/${tenant.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      toast.success('Tenant deleted')
      router.push('/tenants')
    } else {
      const err = await res.json()
      toast.error(err.message)
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
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
  )
}
