import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { Database } from '@/lib/supabase/types'

// Service role client — bypasses RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, subdomain, owner_email, owner_name, phone, plan_slug, password } = body

    if (!name || !subdomain || !owner_email || !owner_name || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Guard: prevent duplicate email across the platform
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', owner_email)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 })
    }

    // Check subdomain uniqueness before creating auth user
    const { data: existingSubdomain } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (existingSubdomain) {
      return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 })
    }

    // Create auth user server-side — bypasses client email rate limits
    // createUser returns an error if the email already exists in auth.users
    // email_confirm: false means they must confirm via email before signing in
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password,
      email_confirm: false,
      user_metadata: { full_name: owner_name, role: 'owner' },
    })

    if (authError || !authData.user) {
      const isDuplicate = authError?.message?.toLowerCase().includes('already registered') ||
        authError?.message?.toLowerCase().includes('already been registered') ||
        authError?.status === 422
      if (isDuplicate) {
        return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 })
      }
      console.error('Auth user creation error:', authError)
      return NextResponse.json({ message: authError?.message || 'Failed to create account' }, { status: 400 })
    }

    const user_id = authData.user.id

    // Get the selected plan (fall back to basic if not specified or not found)
    const { data: basicPlan } = await supabaseAdmin
      .from('plans')
      .select('id, price_monthly')
      .eq('slug', plan_slug || 'basic')
      .maybeSingle()
      .then(async (result) => {
        if (result.data) return result
        return supabaseAdmin.from('plans').select('id, price_monthly').eq('slug', 'basic').single()
      })

    // Create tenant
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name,
        subdomain: subdomain.toLowerCase(),
        owner_email,
        owner_name,
        phone,
        plan_id: basicPlan?.id,
        status: 'trial',
        trial_ends_at: trialEnd.toISOString(),
      })
      .select()
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant creation error:', tenantError)
      // Roll back the auth user so the email isn't permanently blocked
      await supabaseAdmin.auth.admin.deleteUser(user_id)
      return NextResponse.json({ message: 'Failed to create tenant' }, { status: 500 })
    }

    // Create the subscription row up front so the reminder engine and
    // billing portal have consistent data for every tenant from day one
    await supabaseAdmin.from('subscriptions').insert({
      tenant_id: tenant.id,
      plan_id: basicPlan?.id,
      status: 'trialing',
      billing_cycle: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
      amount: basicPlan?.price_monthly ?? 0,
      currency: 'KES',
    })

    // Create main branch
    const { data: branch } = await supabaseAdmin
      .from('branches')
      .insert({
        tenant_id: tenant.id,
        name: 'Main Branch',
        is_main: true,
      })
      .select()
      .single()

    // Link profile to tenant (upsert handles race where trigger hasn't fired yet)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user_id,
          email: owner_email,
          full_name: owner_name,
          tenant_id: tenant.id,
          role: 'owner',
          branch_id: branch?.id,
          is_active: true,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    // Default categories
    await supabaseAdmin.from('categories').insert([
      { tenant_id: tenant.id, name: 'General', color: '#6B7280' },
      { tenant_id: tenant.id, name: 'Food & Beverages', color: '#10B981' },
      { tenant_id: tenant.id, name: 'Electronics', color: '#3B82F6' },
      { tenant_id: tenant.id, name: 'Clothing', color: '#8B5CF6' },
    ])

    // Send confirmation email via Resend
    const origin = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'}`

    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: owner_email,
      options: { redirectTo: `${origin}/api/auth/callback` },
    })

    const confirmUrl = linkData?.properties?.action_link

    if (confirmUrl) {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const subject = 'Confirm your EdosPoa account'
        const { data: sent, error: sendError } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'EdosPoa <noreply@edos.co.ke>',
          to: owner_email,
          subject,
          html: buildConfirmEmail(owner_name, name, confirmUrl),
        })
        await supabaseAdmin.from('email_logs').insert({
          tenant_id: tenant.id,
          recipient: owner_email,
          template: 'welcome',
          subject,
          provider_message_id: sent?.id ?? null,
          status: sendError ? 'failed' : 'sent',
          error: sendError?.message ?? null,
        })
      } else {
        // Dev fallback when RESEND_API_KEY is not set
        console.log(`\n📧 [DEV] Email confirmation link for ${owner_email}:\n${confirmUrl}\n`)
      }
    }

    return NextResponse.json({ tenant_id: tenant.id, subdomain: tenant.subdomain }, { status: 201 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function buildConfirmEmail(ownerName: string, businessName: string, confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <tr><td style="background:#2563eb;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">EdosPoa</h1>
          <p style="margin:4px 0 0;color:#bfdbfe;font-size:14px">Business Management Platform</p>
        </td></tr>
        <tr><td style="padding:40px">
          <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Welcome, ${ownerName}!</p>
          <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
            Your <strong>${businessName}</strong> account has been created. Click the button below to confirm your email address and access your dashboard.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${confirmUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
              Confirm my account
            </a>
          </div>
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6">
            This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center">
          <p style="margin:0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} EdosPoa. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
