import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'
import EtimsComplianceClient from '@/components/tenant/EtimsComplianceClient'
import Link from 'next/link'
import { Settings } from 'lucide-react'

function serviceClient() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function EtimsPage() {
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

  const tenantId = profile.tenant_id

  const { data: etims } = await service
    .from('tenants_etims_settings')
    .select('is_enabled, initialized_at')
    .eq('tenant_id', tenantId)
    .single()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">eTIMS Compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">KRA Electronic Tax Invoice Management System</p>
        </div>
        {['owner', 'manager', 'super_admin'].includes(profile.role) && (
          <Link
            href="/tenant/etims/settings"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            eTIMS Settings
          </Link>
        )}
      </div>

      {!etims?.is_enabled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-amber-900">eTIMS is not enabled for this account</p>
            <p className="text-sm text-amber-700 mt-1">
              Configure your KRA PIN in eTIMS Settings to start submitting tax invoices automatically.
            </p>
          </div>
          {['owner', 'manager', 'super_admin'].includes(profile.role) && (
            <Link href="/tenant/etims/settings"
              className="flex-shrink-0 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
              Configure Now
            </Link>
          )}
        </div>
      )}

      <EtimsComplianceClient tenantId={tenantId} />
    </div>
  )
}
