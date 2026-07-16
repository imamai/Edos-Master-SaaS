'use client'

import { useState } from 'react'
import TenantSidebar from './TenantSidebar'
import TenantTopbar from './TenantTopbar'
import type { Tenant, Profile } from '@/types'

interface Props {
  tenant: Tenant
  profile: Profile
  children: React.ReactNode
}

export default function TenantShell({ tenant, profile, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <TenantSidebar tenant={tenant} profile={profile} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TenantTopbar tenant={tenant} profile={profile} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
