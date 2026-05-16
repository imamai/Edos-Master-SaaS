'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Building2, CreditCard, BarChart3,
  Settings, LogOut, Package, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/plans', label: 'Plans', icon: Package },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-700">
        <span className="font-bold text-lg text-blue-400">EdosPoa</span>
        <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-medium">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
