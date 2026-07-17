import { describe, it, expect } from 'vitest'
import { calculateProration, calculateRenewalPeriod, daysUntil, REMINDER_THRESHOLDS_DAYS } from './pricing'

describe('calculateProration', () => {
  it('charges the price difference spread across remaining days', () => {
    // KES 1000 -> KES 2000 upgrade, 15 of 30 days left in a monthly cycle
    expect(calculateProration(1000, 2000, 15, 'monthly')).toBe(500)
  })

  it('returns 0 for a downgrade (handled separately by deferral)', () => {
    expect(calculateProration(2000, 1000, 15, 'monthly')).toBe(0)
  })

  it('returns 0 for a lateral move at the same price', () => {
    expect(calculateProration(1500, 1500, 15, 'monthly')).toBe(0)
  })

  it('returns 0 when there are no remaining days', () => {
    expect(calculateProration(1000, 2000, 0, 'monthly')).toBe(0)
  })

  it('charges the full difference when upgrading on day one of the cycle', () => {
    expect(calculateProration(1000, 2000, 30, 'monthly')).toBe(1000)
  })

  it('uses the yearly cycle length for yearly subscriptions', () => {
    const result = calculateProration(12000, 24000, 182, 'yearly')
    expect(result).toBeCloseTo((12000 / 365) * 182, 2)
  })
})

describe('calculateRenewalPeriod', () => {
  it('extends from the current period end when renewing before expiry', () => {
    const now = new Date('2026-07-01T00:00:00Z')
    const currentEnd = new Date('2026-07-10T00:00:00Z')
    const { renewFrom, periodEnd } = calculateRenewalPeriod(currentEnd, now, 'monthly')
    expect(renewFrom).toEqual(currentEnd)
    expect(periodEnd).toEqual(new Date('2026-08-09T00:00:00Z'))
  })

  it('extends from now when the previous period already lapsed', () => {
    const now = new Date('2026-07-15T00:00:00Z')
    const currentEnd = new Date('2026-07-01T00:00:00Z') // already in the past
    const { renewFrom, periodEnd } = calculateRenewalPeriod(currentEnd, now, 'monthly')
    expect(renewFrom).toEqual(now)
    expect(periodEnd).toEqual(new Date('2026-08-14T00:00:00Z'))
  })

  it('treats a null current period end as starting from now', () => {
    const now = new Date('2026-07-01T00:00:00Z')
    const { renewFrom } = calculateRenewalPeriod(null, now, 'monthly')
    expect(renewFrom).toEqual(now)
  })

  it('uses the correct cycle length for semiannual and yearly plans', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    expect(calculateRenewalPeriod(null, now, 'semiannual').periodEnd).toEqual(new Date('2026-07-02T00:00:00Z'))
    expect(calculateRenewalPeriod(null, now, 'yearly').periodEnd).toEqual(new Date('2027-01-01T00:00:00Z'))
  })
})

describe('daysUntil', () => {
  it('rounds up partial days so a same-day reminder still fires', () => {
    const from = new Date('2026-07-01T23:00:00Z')
    const target = new Date('2026-07-02T01:00:00Z')
    expect(daysUntil(target, from)).toBe(1)
  })

  it('returns 0 for the exact same instant', () => {
    const now = new Date('2026-07-01T00:00:00Z')
    expect(daysUntil(now, now)).toBe(0)
  })

  it('returns a negative number once the target is in the past', () => {
    const now = new Date('2026-07-10T00:00:00Z')
    const target = new Date('2026-07-01T00:00:00Z')
    expect(daysUntil(target, now)).toBeLessThan(0)
  })
})

describe('REMINDER_THRESHOLDS_DAYS', () => {
  it('matches the exact thresholds requested: 30, 14, 7, 3, 1', () => {
    expect(REMINDER_THRESHOLDS_DAYS).toEqual([30, 14, 7, 3, 1])
  })
})
