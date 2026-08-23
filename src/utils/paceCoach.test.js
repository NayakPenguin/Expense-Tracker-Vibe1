import { describe, expect, it } from 'vitest'
import { getPaceCoachInsights } from './paceCoach'

const NOW = new Date(2026, 7, 10, 12)
const categories = [
  { id: 'food', name: 'Food & Dining' },
  { id: 'transport', name: 'Transport' },
]

function insights(overrides = {}) {
  return getPaceCoachInsights({
    transactions: [],
    categories,
    monthlyBudget: 31000,
    now: NOW,
    ...overrides,
  })
}

describe('getPaceCoachInsights', () => {
  it('calculates a safe daily amount from the remaining inclusive days', () => {
    const result = insights({
      transactions: [
        { date: '2026-08-05', amount: 9000, direction: 'debit', categoryId: 'food' },
      ],
    })

    expect(result.daysLeft).toBe(22)
    expect(result.remainingBudget).toBe(22000)
    expect(result.safeToSpendToday).toBe(1000)
  })

  it('projects the month from actual elapsed calendar days', () => {
    const result = insights({
      transactions: [
        { date: '2026-08-10', amount: 12000, direction: 'debit', categoryId: 'food' },
      ],
    })

    expect(result.projectedSpend).toBe(37200)
    expect(result.status).toBe('over-pace')
  })

  it('does not let a future-dated entry distort the current pace', () => {
    const result = insights({
      transactions: [
        { date: '2026-08-10', amount: 1000, direction: 'debit', categoryId: 'food' },
        { date: '2026-08-20', amount: 9000, direction: 'debit', categoryId: 'food' },
      ],
    })

    expect(result.spentThisMonth).toBe(1000)
    expect(result.projectedSpend).toBe(3100)
  })

  it('compares the latest seven days with the preceding seven days', () => {
    const result = insights({
      transactions: [
        { date: '2026-08-10', amount: 300, direction: 'debit', categoryId: 'food' },
        { date: '2026-08-04', amount: 700, direction: 'debit', categoryId: 'transport' },
        { date: '2026-08-03', amount: 500, direction: 'debit', categoryId: 'food' },
        { date: '2026-07-28', amount: 500, direction: 'debit', categoryId: 'food' },
      ],
    })

    expect(result.spentThisWeek).toBe(1000)
    expect(result.spentPreviousWeek).toBe(1000)
    expect(result.weekChangePercent).toBe(0)
  })

  it('finds the leading weekly category and ignores credits', () => {
    const result = insights({
      transactions: [
        { date: '2026-08-09', amount: 800, direction: 'debit', categoryId: 'food' },
        { date: '2026-08-08', amount: 400, direction: 'debit', categoryId: 'transport' },
        { date: '2026-08-08', amount: 9000, direction: 'credit', categoryId: 'transport' },
      ],
    })

    expect(result.topCategory).toEqual({ id: 'food', name: 'Food & Dining', amount: 800 })
  })

  it('raises the appropriate budget milestone and exceeded state', () => {
    const result = insights({
      monthlyBudget: 10000,
      transactions: [
        { date: '2026-08-02', amount: 11000, direction: 'debit', categoryId: 'food' },
      ],
    })

    expect(result.milestone).toBe(100)
    expect(result.status).toBe('exceeded')
    expect(result.safeToSpendToday).toBe(0)
  })

  it('asks for a budget when no usable target exists', () => {
    const result = insights({ monthlyBudget: 0 })

    expect(result.status).toBe('no-budget')
    expect(result.suggestion.action).toBe('budget')
  })
})
