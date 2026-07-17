'use client'

import { useState } from 'react'
import { Bell, Search, Menu } from 'lucide-react'
import type { Tenant, Profile } from '@/types'
import { formatDate } from '@/lib/utils'

interface Props {
  tenant: Tenant
  profile: Profile
  onMenuClick?: () => void
}

export default function TenantTopbar({ tenant, profile, onMenuClick }: Props) {
  const isTrialing = tenant.status === 'trial'
  const isGrace = tenant.status === 'grace_period'
  const isSuspended = tenant.status === 'suspended'

  return (
    <header className="h-14 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 gap-4 flex-shrink-0 transition-colors">
      <button
        onClick={onMenuClick}
        className="md:hidden -ml-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Status banners */}
      {(isTrialing || isGrace || isSuspended) && (
        <div className={`flex-1 text-center text-xs font-medium px-3 py-1 rounded-full ${
          isSuspended || isGrace
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {isTrialing && tenant.trial_ends_at && (
            <span>
              Trial ends {formatDate(tenant.trial_ends_at)} ·{' '}
              <a href="/settings?tab=Billing" className="underline">Upgrade now</a>
            </span>
          )}
          {isGrace && tenant.grace_period_ends_at && (
            <span>
              Payment failed — account suspends {formatDate(tenant.grace_period_ends_at)} ·{' '}
              <a href="/settings?tab=Billing" className="underline">Update billing</a>
            </span>
          )}
          {isSuspended && (
            <span>
              Account suspended — renew now to restore full access ·{' '}
              <a href="/settings?tab=Billing" className="underline">Renew subscription</a>
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="hidden sm:inline">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
    </header>
  )
}
