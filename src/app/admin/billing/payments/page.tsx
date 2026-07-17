import { createServiceClient } from '@/lib/supabase/server'
import PaymentsClient from '@/components/admin/PaymentsClient'

export default async function BillingPaymentsPage() {
  const supabase = await createServiceClient()

  const [payments, tenants] = await Promise.all([
    supabase
      .from('subscription_payments')
      .select('*, tenant:tenants(name, subdomain)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('tenants').select('id, name').order('name'),
  ])

  return (
    <PaymentsClient
      payments={payments.data ?? []}
      tenants={tenants.data ?? []}
    />
  )
}
