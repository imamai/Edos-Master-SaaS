'use client'

import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import type { Tenant, Profile } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  tenant: Tenant
  profile: Profile
}

export default function TenantTopbar({ tenant, profile }: Props) {
  const isTrialing = tenant.status === 'trial'
  const isGrace = tenant.status === 'grace_period'

  return (
    <header className="h-14 border-b bg-white flex items-center px-4 gap-4 flex-shrink-0">
      {/* Status banners */}
      {(isTrialing || isGrace) && (
        <div className={`flex-1 text-center text-xs font-medium px-3 py-1 rounded-full ${
          isGrace
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {isTrialing && tenant.trial_ends_at && (
            <span>
              Trial ends {formatDate(tenant.trial_ends_at)} ·{' '}
              <a href="/settings" className="underline">Upgrade now</a>
            </span>
          )}
          {isGrace && tenant.grace_period_ends_at && (
            <span>
              Payment failed — account suspends {formatDate(tenant.grace_period_ends_at)} ·{' '}
              <a href="/settings" className="underline">Update billing</a>
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
    </header>
  )
}
