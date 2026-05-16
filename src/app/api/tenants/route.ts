import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    const { user_id, name, subdomain, owner_email, owner_name, phone } = body

    if (!user_id || !name || !subdomain || !owner_email || !owner_name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Check subdomain uniqueness
    const { data: existing } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Subdomain already taken' }, { status: 409 })
    }

    // Get basic plan
    const { data: basicPlan } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('slug', 'basic')
      .single()

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
      return NextResponse.json({ message: 'Failed to create tenant' }, { status: 500 })
    }

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

    // Link profile to tenant
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        tenant_id: tenant.id,
        role: 'owner',
        branch_id: branch?.id,
      })
      .eq('id', user_id)

    if (profileError) {
      console.error('Profile update error:', profileError)
    }

    // Default categories
    await supabaseAdmin.from('categories').insert([
      { tenant_id: tenant.id, name: 'General', color: '#6B7280' },
      { tenant_id: tenant.id, name: 'Food & Beverages', color: '#10B981' },
      { tenant_id: tenant.id, name: 'Electronics', color: '#3B82F6' },
      { tenant_id: tenant.id, name: 'Clothing', color: '#8B5CF6' },
    ])

    return NextResponse.json({ tenant_id: tenant.id, subdomain: tenant.subdomain }, { status: 201 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
