import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export class TenantSuspendedError extends Error {
  constructor() {
    super('This account has been suspended. Renew your subscription to continue.')
    this.name = 'TenantSuspendedError'
  }
}

// Defense-in-depth for sensitive writes (sales, inventory, staff, etc.).
// middleware.ts already blocks a suspended tenant's requests at the edge —
// this is the second, server-side layer for the same invariant, per "never
// rely solely on client-side checks" (and not solely on one server layer
// either). Always call with a tenant_id resolved server-side from the
// authenticated user's own profile — never a client-supplied value.
export async function requireActiveTenant(tenantId: string): Promise<void> {
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('status')
    .eq('id', tenantId)
    .single()

  if (tenant?.status === 'suspended') {
    throw new TenantSuspendedError()
  }
}
