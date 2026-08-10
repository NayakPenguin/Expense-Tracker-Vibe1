import { describe, expect, it } from 'vitest'
import { toLocalISO } from './dates'
import { getRangeBounds } from './dateRanges'

describe('toLocalISO', () => {
  it('reports the local day just after midnight', () => {
    // In any timezone ahead of UTC this instant is still the previous day in
    // UTC, which is the day the old toISOString().slice(0, 10) returned.
    expect(toLocalISO(new Date(2026, 7, 10, 1, 0, 0))).toBe('2026-08-10')
  })

  it('reports the local day late in the evening', () => {
    // The mirror case: behind UTC, this instant is already tomorrow in UTC.
    expect(toLocalISO(new Date(2026, 7, 10, 23, 0, 0))).toBe('2026-08-10')
  })

  it('pads single-digit months and days', () => {
    expect(toLocalISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('getRangeBounds', () => {
  it('starts This Month on the first, not the last day of the previous month', () => {
    const bounds = getRangeBounds('thisMonth', new Date(2026, 7, 10, 12, 0, 0))
    expect(bounds.start).toBe('2026-08-01')
    expect(bounds.end).toBe('2026-08-10')
  })

  it('includes today when the day has only just started', () => {
    const bounds = getRangeBounds('thisMonth', new Date(2026, 7, 10, 0, 30, 0))
    expect(bounds.end).toBe('2026-08-10')
  })

  it('spans three calendar months back for Last 3 Months', () => {
    const bounds = getRangeBounds('last3Months', new Date(2026, 7, 10, 12, 0, 0))
    expect(bounds.start).toBe('2026-06-01')
  })

  it('starts This Year on January 1', () => {
    const bounds = getRangeBounds('thisYear', new Date(2026, 7, 10, 12, 0, 0))
    expect(bounds.start).toBe('2026-01-01')
  })
})
