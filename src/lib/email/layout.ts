// Shared HTML shell for billing-related transactional emails — same
// visual language as the registration confirmation email in
// src/app/api/tenants/route.ts (blue header, white card, EdosPoa wordmark).

export function billingEmailLayout(opts: {
  heading: string
  bodyHtml: string
  accentColor?: string
}): string {
  const accent = opts.accentColor ?? '#2563eb'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <tr><td style="background:${accent};padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">EdosPoa</h1>
          <p style="margin:4px 0 0;color:#bfdbfe;font-size:14px">${opts.heading}</p>
        </td></tr>
        <tr><td style="padding:40px">
          ${opts.bodyHtml}
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

export function billingButton(url: string, label: string, color = '#2563eb'): string {
  return `
  <div style="text-align:center;margin:32px 0">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600">
      ${label}
    </a>
  </div>`
}
