import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  const isProd = process.env.NODE_ENV === 'production'
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    isProd
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
