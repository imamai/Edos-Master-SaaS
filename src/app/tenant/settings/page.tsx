import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/tenant/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const [tenant, plans, staff, branches] = await Promise.all([
    supabase.from('tenants').select('*, plan:plans(*)').eq('id', profile.tenant_id).single(),
    supabase.from('plans').select('*').eq('is_active', true).order('price_monthly'),
    supabase.from('profiles').select('*').eq('tenant_id', profile.tenant_id).order('created_at'),
    supabase.from('branches').select('*').eq('tenant_id', profile.tenant_id).order('name'),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your business configuration</p>
      </div>
      <SettingsClient
        tenant={tenant.data!}
        plans={plans.data || []}
        staff={staff.data || []}
        branches={branches.data || []}
        currentUserId={user.id}
        currentUserRole={profile.role}
      />
    </div>
  )
}
