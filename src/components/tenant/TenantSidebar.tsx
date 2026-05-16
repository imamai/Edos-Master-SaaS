'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ShoppingCart, Package, Receipt, Users, Truck, TrendingDown,
  BarChart3, Settings, LogOut, Store, LayoutDashboard, ShieldCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tenant, Profile } from '@/types'

interface Props {
  tenant: Tenant
  profile: Profile
}

export default function TenantSidebar({ tenant, profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // On localhost, the app uses path-based routing (/tenant/*) instead of subdomains
  const base = pathname.startsWith('/tenant') ? '/tenant' : ''

  const navItems = [
    { href: base || '/', label: 'POS Terminal', icon: ShoppingCart, exact: true },
    { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/inventory`, label: 'Inventory', icon: Package },
    { href: `${base}/sales`, label: 'Sales', icon: Receipt },
    { href: `${base}/customers`, label: 'Customers', icon: Users },
    { href: `${base}/suppliers`, label: 'Suppliers', icon: Truck },
    { href: `${base}/expenses`, label: 'Expenses', icon: TrendingDown },
    { href: `${base}/reports`, label: 'Reports', icon: BarChart3 },
    { href: `${base}/etims`, label: 'eTIMS', icon: ShieldCheck },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    const loginUrl = window.location.hostname.includes('localhost')
      ? 'http://localhost:3000/login'
      : '/login'
    router.push(loginUrl)
  }

  return (
    <aside className="w-56 flex flex-col h-screen border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        {tenant.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logo_url} alt={tenant.name} className="h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: tenant.primary_color }}
            >
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 truncate">{tenant.name}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              style={isActive ? { backgroundColor: tenant.primary_color } : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: tenant.primary_color }}
          >
            {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
