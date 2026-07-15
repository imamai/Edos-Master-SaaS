import { NextRequest, NextResponse } from 'next/server'
import { querySTKStatus } from '@/lib/mpesa'
import { createClient as adminClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { MpesaCredentials } from '@/lib/mpesa'

const supabaseAdmin = adminClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getTenantCredentials(tenantId: string): Promise<MpesaCredentials> {
  const { data, error } = await supabaseAdmin
    .from('tenant_mpesa_settings')
    .select('consumer_key, consumer_secret, shortcode, passkey, environment')
    .eq('tenant_id', tenantId)
    .single()

  if (error || !data) throw new Error('M-Pesa not configured for this tenant')

  return {
    consumerKey: data.consumer_key,
    consumerSecret: data.consumer_secret,
    shortcode: data.shortcode,
    passkey: data.passkey,
    environment: (data.environment as 'sandbox' | 'production') ?? 'sandbox',
  }
}

export async function POST(req: NextRequest) {
  const { checkoutRequestId, tenantId } = await req.json()

  if (!checkoutRequestId || !tenantId) {
    return NextResponse.json({ message: 'Missing checkoutRequestId or tenantId' }, { status: 400 })
  }

  try {
    const credentials = await getTenantCredentials(tenantId)
    const result = await querySTKStatus(checkoutRequestId, credentials)
    return NextResponse.json(result)
  } catch (err) {
    console.error('STK Query error:', err)
    return NextResponse.json({ message: 'Query failed' }, { status: 500 })
  }
}
