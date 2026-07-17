import { billingEmailLayout, billingButton } from '../layout'

interface BillingEmailContext {
  tenantName: string
  ownerName: string
  billingUrl: string
  planName: string
  periodEndLabel: string
}

export function subscriptionExpiringEmail(ctx: BillingEmailContext & { daysLeft: number }): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName, periodEndLabel, daysLeft } = ctx
  const dayWord = daysLeft === 1 ? 'day' : 'days'
  return {
    subject: `${tenantName}: your EdosPoa subscription expires in ${daysLeft} ${dayWord}`,
    html: billingEmailLayout({
      heading: 'Subscription Expiring Soon',
      accentColor: '#d97706',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          Your <strong>${planName}</strong> plan for <strong>${tenantName}</strong> expires on
          <strong>${periodEndLabel}</strong> — that's ${daysLeft} ${dayWord} away. Renew before then to avoid
          any interruption to your dashboard, POS terminal, and reports.
        </p>
        ${billingButton(billingUrl, 'Manage Billing', '#d97706')}
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6">
          After expiry your account enters a grace period before access is restricted.
        </p>`,
    }),
  }
}

export function subscriptionExpiredEmail(ctx: BillingEmailContext & { graceDays: number }): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName, graceDays } = ctx
  return {
    subject: `${tenantName}: your EdosPoa subscription has expired`,
    html: billingEmailLayout({
      heading: 'Subscription Expired',
      accentColor: '#dc2626',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          Your <strong>${planName}</strong> plan for <strong>${tenantName}</strong> has expired today.
          You still have full access for a <strong>${graceDays}-day grace period</strong> — renew now to
          keep it that way. If no payment is received before the grace period ends, your account will be
          suspended and dashboard/POS access will be blocked.
        </p>
        ${billingButton(billingUrl, 'Renew Now', '#dc2626')}`,
    }),
  }
}

export function accountSuspendedEmail(ctx: BillingEmailContext): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName } = ctx
  return {
    subject: `${tenantName}: your EdosPoa account has been suspended`,
    html: billingEmailLayout({
      heading: 'Account Suspended',
      accentColor: '#991b1b',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          Your grace period for the <strong>${planName}</strong> plan on <strong>${tenantName}</strong> has
          ended without payment, so your account has been suspended. Dashboard, POS, inventory and report
          access are blocked until you renew — your data is safe and access resumes immediately after payment.
        </p>
        ${billingButton(billingUrl, 'Renew to Restore Access', '#991b1b')}`,
    }),
  }
}

export function invoiceCreatedEmail(ctx: BillingEmailContext & { invoiceNumber: string; amountLabel: string; dueDateLabel: string; reason: 'renewal' | 'proration' }): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName, invoiceNumber, amountLabel, dueDateLabel, reason } = ctx
  const reasonLabel = reason === 'proration' ? 'plan upgrade' : 'renewal'
  return {
    subject: `${tenantName}: invoice ${invoiceNumber} for ${amountLabel}`,
    html: billingEmailLayout({
      heading: 'New Invoice',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          A new invoice <strong>${invoiceNumber}</strong> for <strong>${amountLabel}</strong> has been generated
          for your ${reasonLabel} on the <strong>${planName}</strong> plan (<strong>${tenantName}</strong>),
          due <strong>${dueDateLabel}</strong>.
        </p>
        ${billingButton(billingUrl, 'Pay Now')}`,
    }),
  }
}

export function paymentReminderEmail(ctx: BillingEmailContext & { invoiceNumber: string; amountLabel: string; dueDateLabel: string }): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, invoiceNumber, amountLabel, dueDateLabel } = ctx
  return {
    subject: `${tenantName}: payment reminder for invoice ${invoiceNumber}`,
    html: billingEmailLayout({
      heading: 'Payment Reminder',
      accentColor: '#d97706',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          Invoice <strong>${invoiceNumber}</strong> for <strong>${amountLabel}</strong> on <strong>${tenantName}</strong>
          is still unpaid, due <strong>${dueDateLabel}</strong>. Pay now to avoid any interruption.
        </p>
        ${billingButton(billingUrl, 'Pay Now', '#d97706')}`,
    }),
  }
}

export function paymentReceivedEmail(ctx: BillingEmailContext & { amountLabel: string; methodLabel: string; receiptLabel: string }): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName, amountLabel, methodLabel, receiptLabel } = ctx
  return {
    subject: `${tenantName}: payment received — ${amountLabel}`,
    html: billingEmailLayout({
      heading: 'Payment Received',
      accentColor: '#16a34a',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          We've received your payment of <strong>${amountLabel}</strong> via ${methodLabel} for
          <strong>${tenantName}</strong>'s <strong>${planName}</strong> plan. Receipt: <strong>${receiptLabel}</strong>.
        </p>
        ${billingButton(billingUrl, 'View Billing', '#16a34a')}`,
    }),
  }
}

export function subscriptionRenewedEmail(ctx: BillingEmailContext): { subject: string; html: string } {
  const { tenantName, ownerName, billingUrl, planName, periodEndLabel } = ctx
  return {
    subject: `${tenantName}: subscription renewed`,
    html: billingEmailLayout({
      heading: 'Subscription Renewed',
      accentColor: '#16a34a',
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">Hi ${ownerName},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6">
          Your <strong>${planName}</strong> plan for <strong>${tenantName}</strong> has been renewed and is now
          active until <strong>${periodEndLabel}</strong>. Thanks for staying with EdosPoa!
        </p>
        ${billingButton(billingUrl, 'View Billing', '#16a34a')}`,
    }),
  }
}
