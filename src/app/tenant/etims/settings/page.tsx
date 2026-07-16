import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import EtimsSettingsClient from '@/components/tenant/EtimsSettingsClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function serviceClient() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function EtimsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = serviceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) redirect('/login')
  if (!['owner', 'manager', 'super_admin'].includes(profile.role)) redirect('/tenant/etims')

  const tenantId = profile.tenant_id

  const { data: settings } = await service
    .from('tenants_etims_settings')
    .select('id, is_enabled, environment, kra_pin, branch_id, device_serial, next_invoice_no, initialized_at')
    .eq('tenant_id', tenantId)
    .single()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tenant/etims"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">eTIMS Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure KRA eTIMS integration for this business</p>
        </div>
      </div>

      <EtimsSettingsClient tenantId={tenantId} initialSettings={settings || null} />
    </div>
  )
}
