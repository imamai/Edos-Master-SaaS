import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface SendBillingEmailArgs {
  tenantId: string
  to: string
  template: string
  subject: string
  html: string
}

// Central send path for every billing-related email — always logs to
// email_logs (success or failure) so delivery history is auditable from
// the Super Admin Billing Portal, matching the pattern of every other
// Resend call site in this codebase (registration, PO-to-supplier).
export async function sendBillingEmail({ tenantId, to, template, subject, html }: SendBillingEmailArgs): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n📧 [DEV] ${template} email to ${to}: ${subject}\n`)
    await supabaseAdmin.from('email_logs').insert({ tenant_id: tenantId, recipient: to, template, subject, status: 'sent' })
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'EdosPoa <noreply@edos.co.ke>',
    to,
    subject,
    html,
  })

  await supabaseAdmin.from('email_logs').insert({
    tenant_id: tenantId,
    recipient: to,
    template,
    subject,
    provider_message_id: data?.id ?? null,
    status: error ? 'failed' : 'sent',
    error: error?.message ?? null,
  })
}
