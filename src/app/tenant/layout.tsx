import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import TenantShell from '@/components/tenant/TenantShell'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edoscentre.co.ke'
  const isDev = process.env.NODE_ENV === 'development'
  const loginUrl = isDev
    ? 'http://localhost:3000/login'
    : `https://${rootDomain}/login`

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

  // The subdomain the request actually came in on (set by middleware.ts) must
  // match the authenticated user's own tenant. Without this check, a session
  // cookie issued on Tenant A's subdomain (Domain=.edos.co.ke) would silently
  // render Tenant A's data while the browser shows Tenant B's subdomain/branding.
  const requestTenantId = (await headers()).get('x-tenant-id')
  if (requestTenantId && requestTenantId !== tenant.id) {
    redirect(isDev
      ? `http://${tenant.subdomain}.localhost:3000`
      : `https://${tenant.subdomain}.${rootDomain}`)
  }

  // middleware.ts already restricts a suspended tenant to /settings and
  // /support before any other /tenant/* route is reachable — render the
  // normal shell here (with sidebar/logout) so those allowed pages work,
  // TenantTopbar shows a persistent suspended banner.
  return (
    <TenantShell tenant={tenant} profile={profile}>
      {children}
    </TenantShell>
  )
}
