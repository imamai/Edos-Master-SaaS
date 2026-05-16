import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import TenantSidebar from '@/components/tenant/TenantSidebar'
import TenantTopbar from '@/components/tenant/TenantTopbar'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const loginUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/login'
    : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'}/login`

  if (!user) redirect(loginUrl)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, branch:branches(name)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.tenant_id) redirect(loginUrl)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, plan:plans(*)')
    .eq('id', profile.tenant_id)
    .single()

  if (!tenant) redirect(loginUrl)

  if (tenant.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Account Suspended</h1>
          <p className="text-gray-600">Please contact support to reactivate your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TenantSidebar tenant={tenant} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TenantTopbar tenant={tenant} profile={profile} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
