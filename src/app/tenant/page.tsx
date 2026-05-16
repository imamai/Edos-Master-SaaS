import { createClient } from '@/lib/supabase/server'
import POSTerminal from '@/components/pos/POSTerminal'

export default async function POSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, branch_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, phone, primary_color, metadata')
    .eq('id', profile.tenant_id)
    .single()

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-full text-red-600 text-sm">
        Could not load store settings. Please refresh the page.
      </div>
    )
  }

  const meta = (tenant.metadata ?? {}) as Record<string, string>

  return (
    <POSTerminal
      tenantId={profile.tenant_id}
      tenantName={tenant.name}
      tenantPhone={tenant.phone ?? undefined}
      tenantAddress={meta.address || undefined}
      tenantKraPIN={meta.kra_pin || undefined}
      quotationNotes={meta.quotation_notes || undefined}
      invoiceTerms={meta.invoice_terms || undefined}
      paymentInstructions={meta.payment_instructions || undefined}
      primaryColor={tenant.primary_color ?? undefined}
      branchId={profile.branch_id ?? null}
      cashierId={user.id}
    />
  )
}
