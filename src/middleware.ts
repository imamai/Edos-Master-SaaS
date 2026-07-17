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
    if (pathname.startsWith('/api')) {
      return updateSession(request)
    }
    const url = request.nextUrl.clone()
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    const response = NextResponse.rewrite(url)
    return withSessionCookies(request, response)
  }

  // ── Tenant subdomain ────────────────────────────────────────
  // Verify tenant exists and is not suspended (also applies to /api/* so a
  // suspended tenant's still-valid session cookie can't be used to hit
  // tenant-scoped API routes directly).
  const { supabase, response: sessionResponse } = createMiddlewareClient(request)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, status, subdomain, name, primary_color')
    .eq('subdomain', subdomain)
    .single()

  if (!tenant) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 })
    }
    const url = request.nextUrl.clone()
    url.hostname = ROOT_DOMAIN
    url.pathname = '/not-found'
    url.port = ''
    return NextResponse.redirect(url)
  }

  // A suspended tenant keeps access only to billing/renewal, support, and
  // logout — everything else (dashboard, POS, inventory, reports, APIs) is
  // blocked. Login is unaffected (handled separately, before a session even
  // resolves a tenant). Redirects stay on the tenant's own subdomain so the
  // billing page they land on actually works, instead of bouncing to a
  // separate root-domain page.
  if (tenant.status === 'suspended') {
    const allowedPagePrefixes = ['/settings', '/support']
    const allowedApiPrefixes = ['/api/billing']
    const isApi = pathname.startsWith('/api')
    const isAllowed = isApi
      ? allowedApiPrefixes.some((p) => pathname.startsWith(p))
      : allowedPagePrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

    if (!isAllowed) {
      if (isApi) {
        return NextResponse.json({ message: 'This account has been suspended. Renew your subscription to continue.' }, { status: 403 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/settings'
      url.search = 'tab=Billing'
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/api')) {
    return updateSession(request)
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
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'
  // Only set cross-subdomain cookie when actually on the root domain
  const cookieDomain = (host === rootDomain || host.endsWith(`.${rootDomain}`))
    ? `.${rootDomain}`
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
