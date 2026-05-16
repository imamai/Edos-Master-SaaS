import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'
  // Only set cross-subdomain cookie when actually on the root domain
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const isOnRootDomain = hostname === rootDomain || hostname.endsWith(`.${rootDomain}`)

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    isOnRootDomain
      ? {
          cookieOptions: {
            domain: `.${rootDomain}`,
            path: '/',
            sameSite: 'lax',
            secure: true,
          },
        }
      : {}
  )
}
