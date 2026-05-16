import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

function getHostname(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.hostname
  )
}

function extractSubdomain(hostname: string): string | null {
  // Production: client1.edos.co.ke → "client1"
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    return hostname.slice(0, -(ROOT_DOMAIN.length + 1))
  }
  // Vercel preview: client1.edospoa.vercel.app → skip (no subdomain routing on previews)
  if (hostname.endsWith('.vercel.app')) return null

  // Local dev: client1.localhost:3000 → "client1"
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[0] !== 'localhost') return parts[0]
  }
  return null
}

export async function middleware(request: NextRequest) {
  const hostname = getHostname(request)
  const { pathname } = request.nextUrl
  const subdomain = extractSubdomain(hostname)

  // Passthrough for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return updateSession(request)
  }

  // ── Root domain: marketing site ────────────────────────────
  if (!subdomain || hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return updateSession(request)
  }

  // ── Admin subdomain ─────────────────────────────────────────
  if (subdomain === 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    const response = NextResponse.rewrite(url)
    return withSessionCookies(request, response)
  }

  // ── Tenant subdomain ────────────────────────────────────────
  // Verify tenant exists and is not suspended
  const { supabase, response: sessionResponse } = createMiddlewareClient(request)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, status, subdomain, name, primary_color')
    .eq('subdomain', subdomain)
    .single()

  if (!tenant) {
    const url = request.nextUrl.clone()
    url.hostname = ROOT_DOMAIN
    url.pathname = '/not-found'
    url.port = ''
    return NextResponse.redirect(url)
  }

  if (tenant.status === 'suspended') {
    const url = request.nextUrl.clone()
    url.pathname = `/suspended`
    url.hostname = ROOT_DOMAIN
    url.port = ''
    return NextResponse.redirect(url)
  }

  // Rewrite to /tenant/* internally
  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `/tenant${pathname === '/' ? '' : pathname}`

  const rewriteResponse = NextResponse.rewrite(rewriteUrl)

  // Forward tenant metadata to pages via headers
  rewriteResponse.headers.set('x-tenant-id', tenant.id)
  rewriteResponse.headers.set('x-tenant-subdomain', subdomain)
  rewriteResponse.headers.set('x-tenant-name', tenant.name)
  rewriteResponse.headers.set('x-tenant-color', tenant.primary_color)
  rewriteResponse.headers.set('x-tenant-status', tenant.status)

  // Copy session cookies from Supabase middleware
  sessionResponse.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value, cookie as Parameters<typeof rewriteResponse.cookies.set>[2])
  })

  return rewriteResponse
}

function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({ request })
  const cookieDomain =
    process.env.NODE_ENV === 'production'
      ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'}`
      : undefined

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              ...(cookieDomain ? { domain: cookieDomain } : {}),
            })
          )
        },
      },
    }
  )

  return { supabase, response }
}

async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { supabase, response } = createMiddlewareClient(request)
  // Refresh the session so Server Components get the latest user
  await supabase.auth.getUser()
  return response
}

function withSessionCookies(request: NextRequest, targetResponse: NextResponse): NextResponse {
  const { response } = createMiddlewareClient(request)
  response.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie.name, cookie.value, cookie as Parameters<typeof targetResponse.cookies.set>[2])
  })
  return targetResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
