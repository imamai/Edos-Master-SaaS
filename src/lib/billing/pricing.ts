// Pure billing math — deliberately dependency-free (no Supabase, no fetch)
// so it can be unit tested in isolation and reused by both the plan-change
// route and the shared applySubscriptionPayment() renewal path.

export const CYCLE_DAYS: Record<string, number> = { monthly: 30, semiannual: 182, yearly: 365 }

export function daysUntil(target: Date, from: Date): number {
  return Math.ceil((target.getTime() - from.getTime()) / 86_400_000)
}

/**
 * Prorated charge for an immediate upgrade: the price difference spread
 * across the days remaining in the current billing period. Returns 0 (never
 * negative) when the new plan isn't actually more expensive — downgrades are
 * handled separately by deferring to the next renewal, not by this function.
 */
export function calculateProration(oldPrice: number, newPrice: number, remainingDays: number, cycle: string): number {
  const totalDays = CYCLE_DAYS[cycle] ?? 30
  if (newPrice <= oldPrice || totalDays <= 0 || remainingDays <= 0) return 0
  const raw = ((newPrice - oldPrice) / totalDays) * remainingDays
  return Math.round(raw * 100) / 100
}

/**
 * Renewal period math: paying early never shortens time already covered by
 * the current period — the new period starts from whichever is later, the
 * current period end or now.
 */
export function calculateRenewalPeriod(currentPeriodEnd: Date | null, now: Date, cycle: string): { renewFrom: Date; periodEnd: Date } {
  const currentEnd = currentPeriodEnd ?? now
  const renewFrom = currentEnd > now ? currentEnd : now
  const periodEnd = new Date(renewFrom.getTime() + (CYCLE_DAYS[cycle] ?? 30) * 86_400_000)
  return { renewFrom, periodEnd }
}

export const REMINDER_THRESHOLDS_DAYS = [30, 14, 7, 3, 1]
