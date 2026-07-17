// Daily subscription lifecycle engine — Vercel Cron hits this once a day.
// Handles: renewal reminders (30/14/7/3/1 days out), trial/subscription
// expiry -> grace period, and grace period -> suspension. Idempotent: every
// transition/email is guarded by a unique row in notification_logs keyed on
// (subscription_id, notification_type, period_end), so re-running the same
// day (retry, manual trigger, etc.) never double-sends or double-transitions.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { sendBillingEmail } from '@/lib/email/send'
import { subscriptionExpiringEmail, subscriptionExpiredEmail, accountSuspendedEmail } from '@/lib/email/templates/billing'
import { daysUntil, REMINDER_THRESHOLDS_DAYS } from '@/lib/billing/pricing'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

function billingUrlFor(subdomain: string): string {
  return `https://${subdomain}.${ROOT_DOMAIN}/settings?tab=Billing`
}

type TenantWithSub = Database['public']['Tables']['tenants']['Row'] & {
  subscriptions: Database['public']['Tables']['subscriptions']['Row'][]
  plan: { name: string } | null
}

function latestSubscription(subs: Database['public']['Tables']['subscriptions']['Row'][]) {
  return [...subs].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Kill switch — defaults to DISABLED. Every current tenant's
  // current_period_end predates real payment collection (Phase 4 isn't
  // built yet), so flipping this on today would immediately move every
  // trial/active tenant into grace_period on the very first run. Only
  // set BILLING_ENGINE_ENABLED=true once renewals can actually be paid.
  if (process.env.BILLING_ENGINE_ENABLED !== 'true') {
    return NextResponse.json({ ok: true, skipped: 'BILLING_ENGINE_ENABLED is not "true" — engine disabled' })
  }

  const now = new Date()
  const summary = { reminders_sent: 0, moved_to_grace: 0, suspended: 0, errors: [] as string[] }

  const { data: tenants, error } = await supabaseAdmin
    .from('tenants')
    .select('*, subscriptions(*), plan:plans(name)')
    .in('status', ['trial', 'active', 'grace_period'])

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  for (const tenant of (tenants ?? []) as unknown as TenantWithSub[]) {
    const sub = latestSubscription(tenant.subscriptions)
    if (!sub || !sub.current_period_end) {
      summary.errors.push(`${tenant.id}: no subscription / current_period_end`)
      continue
    }

    const periodEnd = new Date(sub.current_period_end)
    const daysLeft = daysUntil(periodEnd, now)
    const planName = tenant.plan?.name ?? 'your plan'
    const billingUrl = billingUrlFor(tenant.subdomain)
    const periodEndLabel = periodEnd.toLocaleDateString('en-KE', { dateStyle: 'long' })
    const emailCtx = { tenantName: tenant.name, ownerName: tenant.owner_name, billingUrl, planName, periodEndLabel }

    try {
      if (tenant.status === 'trial' || tenant.status === 'active') {
        if (daysLeft > 0 && REMINDER_THRESHOLDS_DAYS.includes(daysLeft)) {
          const { error: dedupeErr } = await supabaseAdmin.from('notification_logs').insert({
            tenant_id: tenant.id,
            subscription_id: sub.id,
            notification_type: `reminder_${daysLeft}`,
            period_end: sub.current_period_end,
          })
          if (!dedupeErr) {
            const email = subscriptionExpiringEmail({ ...emailCtx, daysLeft })
            await sendBillingEmail({ tenantId: tenant.id, to: tenant.owner_email, template: 'subscription_expiring', subject: email.subject, html: email.html })
            summary.reminders_sent++
          }
        } else if (daysLeft <= 0) {
          const { error: dedupeErr } = await supabaseAdmin.from('notification_logs').insert({
            tenant_id: tenant.id,
            subscription_id: sub.id,
            notification_type: 'expiry',
            period_end: sub.current_period_end,
          })
          if (!dedupeErr) {
            const graceEnd = new Date(now.getTime() + tenant.grace_period_days * 86_400_000)
            await supabaseAdmin.from('tenants').update({ status: 'grace_period', grace_period_ends_at: graceEnd.toISOString() }).eq('id', tenant.id)
            await supabaseAdmin.from('subscriptions').update({ status: 'past_due' }).eq('id', sub.id)
            await supabaseAdmin.from('subscription_audit_logs').insert({
              tenant_id: tenant.id,
              subscription_id: sub.id,
              actor_type: 'system',
              action: 'grace_started',
              old_value: { status: tenant.status },
              new_value: { status: 'grace_period', grace_period_ends_at: graceEnd.toISOString() },
            })
            const email = subscriptionExpiredEmail({ ...emailCtx, graceDays: tenant.grace_period_days })
            await sendBillingEmail({ tenantId: tenant.id, to: tenant.owner_email, template: 'subscription_expired', subject: email.subject, html: email.html })
            summary.moved_to_grace++
          }
        }
      } else if (tenant.status === 'grace_period') {
        if (tenant.grace_period_ends_at && new Date(tenant.grace_period_ends_at) <= now) {
          const { error: dedupeErr } = await supabaseAdmin.from('notification_logs').insert({
            tenant_id: tenant.id,
            subscription_id: sub.id,
            notification_type: 'suspension',
            period_end: sub.current_period_end,
          })
          if (!dedupeErr) {
            await supabaseAdmin.from('tenants').update({ status: 'suspended' }).eq('id', tenant.id)
            await supabaseAdmin.from('subscription_audit_logs').insert({
              tenant_id: tenant.id,
              subscription_id: sub.id,
              actor_type: 'system',
              action: 'suspended',
              old_value: { status: 'grace_period' },
              new_value: { status: 'suspended' },
            })
            const email = accountSuspendedEmail(emailCtx)
            await sendBillingEmail({ tenantId: tenant.id, to: tenant.owner_email, template: 'account_suspended', subject: email.subject, html: email.html })
            summary.suspended++
          }
        }
      }
    } catch (err) {
      summary.errors.push(`${tenant.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({ ok: true, ...summary })
}
