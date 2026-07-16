import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const explicitNext = searchParams.get('next')
  const next = explicitNext ?? '/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

      // Honor an explicit redirect target (e.g. password recovery -> /update-password)
      // instead of always sending the user straight to their tenant dashboard.
      if (!explicitNext) {
        // After confirming email, send user directly to their tenant dashboard
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

          const profile = profileData as { tenant_id: string | null } | null
          if (profile?.tenant_id) {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('subdomain')
              .eq('id', profile.tenant_id)
              .single()

            const tenant = tenantData as { subdomain: string } | null
            if (tenant?.subdomain) {
              const dest = isLocalEnv
                ? `${origin}/tenant`
                : `https://${tenant.subdomain}.${rootDomain}`
              return NextResponse.redirect(dest)
            }
          }
        }
      }

      // Fallback: send to login
      const forwardedHost = request.headers.get('x-forwarded-host')
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
