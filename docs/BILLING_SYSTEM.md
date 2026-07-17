# Subscription Billing System

Automated subscription, billing, reminder, and license-enforcement system for EdosPoa. Built in 6 phases (see git history / commit messages for `phase 0`–`phase 6`); this doc covers deployment, environment variables, and rollback — read the inline comments in the files below for the "why" behind each design decision.

## Architecture at a glance

| Concern | Where |
|---|---|
| Payment state machine (extend period, reactivate tenant, receipt, emails) | `src/lib/billing/applyPayment.ts` — the one place every rail funds |
| Proration / renewal-period math (pure, unit tested) | `src/lib/billing/pricing.ts` |
| License enforcement (edge) | `src/middleware.ts` — suspended tenants allowed only `/settings`, `/support`, `/api/billing/*` |
| License enforcement (server, defense-in-depth) | `src/lib/billing/guard.ts` → `requireActiveTenant()` |
| Reminder + status-transition cron | `src/app/api/cron/subscription-engine/route.ts` (daily, Vercel Cron) |
| Payment rails | Stripe: `src/app/api/webhooks/stripe/route.ts` · M-Pesa: `src/app/api/billing/mpesa/initiate` + `src/app/api/webhooks/mpesa-subscription` · Bank transfer: `src/app/api/billing/bank-transfer` · Manual/approvals: `src/app/api/admin/billing/*` |
| Plan upgrade/downgrade | `src/app/api/billing/change-plan/route.ts` |
| Email templates + delivery log | `src/lib/email/templates/billing.ts`, `src/lib/email/send.ts` (logs to `email_logs`) |
| Super Admin Billing Portal | `src/app/admin/billing/**` |
| Tenant-facing billing UI | Settings → Billing tab, `src/components/tenant/SettingsClient.tsx` |

## Environment variables

See `.env.local.example` for the authoritative, commented list. Summary of what's new for this system:

| Variable | Required for | Notes |
|---|---|---|
| `CRON_SECRET` | Reminder/status cron | Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when this is set as a Vercel env var — must match. |
| `BILLING_ENGINE_ENABLED` | Reminder/status cron | **Kill switch, defaults to disabled.** See "Enabling the engine" below before flipping to `true`. |
| `PLATFORM_MPESA_*` (5 vars) | M-Pesa subscription rail | EdosPoa's **own** Paybill/Till credentials — never confuse with `tenant_mpesa_settings`, which is each tenant's own till for their own sales. |
| `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_PHONE` | `/tenant/support` page | Optional, falls back to placeholder values. |

Already-existing vars this system reuses as-is: `RESEND_API_KEY`, `EMAIL_FROM`, `MPESA_WEBHOOK_SECRET` (shared secret, reused for the new `mpesa-subscription` callback), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_ROOT_DOMAIN`.

## Database migrations applied (in order)

`017_billing_phase0_schema_reconciliation.sql`, `018_billing_phase1_tables.sql`, `019_billing_phase4_plan_changes.sql`, `020_billing_proofs_bucket.sql`. All already applied to the live project (`kqpltwrhzbjfyxkttwzh`) via the Supabase MCP tooling — these files exist locally for documentation/future-baseline purposes only, per this repo's established pattern (see other files in `supabase/migrations/`; the live migration history is the actual source of truth, not this folder).

## Deploying to Vercel

1. Add every env var above to the Vercel project (Production **and** Preview if you test there).
2. Set `CRON_SECRET` as a Vercel **Cron Secret** so Vercel's own cron dispatcher sends it automatically (Vercel dashboard → Project → Settings → Environment Variables → add `CRON_SECRET`; Vercel Cron reads it from the same env var).
3. `vercel.json` already defines the daily cron (`0 3 * * *` — 06:00 EAT) hitting `/api/cron/subscription-engine`. No further Vercel config needed — crons deploy automatically with the project.
4. Leave `BILLING_ENGINE_ENABLED=false` on first deploy (see below).
5. `npm run test` (vitest) and `npm run type-check` should both pass before deploying — wire these into your CI if you have one; neither currently runs automatically.

## Enabling the reminder/status engine

**Do not set `BILLING_ENGINE_ENABLED=true` without reading this.** As of this system's build date, every existing tenant's `current_period_end` predates real payment collection — flipping the switch on immediately moves every trial/active tenant into `grace_period` on the very first cron run (confirmed by inspecting live data before shipping). Before enabling:

1. Make sure at least one payment rail is actually configured and tested end-to-end (Stripe keys are real, or `PLATFORM_MPESA_*` is set, or you're prepared to approve bank/manual payments promptly).
2. Consider running the cron once manually against a Supabase branch (`create_branch` via the Supabase MCP tools, or the Supabase CLI) to see exactly what it would do before pointing it at production.
3. Flip `BILLING_ENGINE_ENABLED=true` in Vercel, redeploy (or wait for the next scheduled run).
4. Watch `/admin/billing` and `/admin/billing/emails` closely for the first few days.

## Known follow-ups (explicitly out of scope for this pass)

- **`payment_reminder` email exists but isn't auto-triggered yet.** It's for a specific pending invoice going overdue (distinct from the `subscription_expiring` reminders the cron already sends). Wiring it means extending the cron to also scan `invoices` for overdue `pending` rows, using the same `notification_logs` dedupe pattern.
- **M-Pesa Daraja token is not cached** (`src/lib/mpesa/index.ts` `getAccessToken`) — re-authenticates on every call. Pre-existing before this system, left untouched to avoid risking the working POS sales M-Pesa flow; worth fixing separately with its own test pass.
- **Settings-tab restriction for suspended tenants is UI-level, not an RLS boundary.** Middleware blocks suspended tenants from every `/tenant/*` route except `/settings` and `/support`; within the (now reachable) Settings page, `SettingsClient` hides every tab except Billing when suspended — but the underlying direct-Supabase writes those other tabs would trigger (e.g. adding a category) aren't separately blocked by RLS for suspended status. Low risk in practice since the page path itself is what's actually gated, but worth hardening later if it matters.
- **`requireActiveTenant()` is wired into one route** (`/api/sales/complete`, the highest-value POS write) as the defense-in-depth proof of concept. Middleware's page-level gating is the dominant enforcement layer given this app's architecture (most CRUD is direct client→Supabase, not API-route-mediated) — extending the guard to every other write route is a separate, mechanical follow-up pass, not done here to keep this change's blast radius bounded.
- **Full live test of the Phase 2 cron's actual transition logic was intentionally not run** against production (would have real side effects — moving real tenants to `grace_period` and emailing their real `owner_email`). Auth + kill-switch behavior were verified live; the transition/reminder logic itself was verified by code review, unit-tested pure math, and a middleware-only dry run (temporarily flipping a throwaway test tenant to `suspended` and reverting).

## Rollback strategy

Every phase's schema change is additive (new tables/columns) except Phase 0's two RLS policies and Phase 0's column additions on `subscriptions`/`invoices` — all trivially reversible:

- **Disable behavior instantly, no deploy needed:** set `BILLING_ENGINE_ENABLED=false` in Vercel env vars (or just don't set it) — the cron becomes a no-op immediately on its next invocation.
- **Roll back a specific migration:** each `01N_*.sql` file's changes are additive `CREATE TABLE`/`ADD COLUMN`/`CREATE POLICY` statements — reverse with the corresponding `DROP TABLE` / `DROP COLUMN` / `DROP POLICY`, run via the Supabase MCP `execute_sql`/`apply_migration` tools against project `kqpltwrhzbjfyxkttwzh`. No migration in this set includes a destructive `ALTER ... DROP` or data-loss operation on existing columns.
- **Roll back the code:** every new file is net-new (no existing file's behavior changed except the four surgical edits: `create-checkout/route.ts`, `api/tenants/route.ts`, `webhooks/stripe/route.ts`, `middleware.ts`, `tenant/layout.tsx`, `TenantTopbar.tsx`, `SettingsClient.tsx`, `TenantSidebar.tsx` — all listed in the relevant commit). Reverting those specific commits restores prior behavior cleanly.
- **Cron itself:** remove the `crons` entry from `vercel.json` and redeploy to stop Vercel from ever calling the route, independent of the app-level kill switch.
