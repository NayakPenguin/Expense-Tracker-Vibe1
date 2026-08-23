import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import Coach from './Coach'

vi.mock('../context/AppDataContext', () => ({
  useAppData: () => ({
    transactions: [],
    categories: [],
    budget: { monthlyBudget: 30000 },
  }),
}))

const analyticsMocks = vi.hoisted(() => ({ trackAnalyticsEvent: vi.fn() }))
vi.mock('../lib/firebase', () => ({
  trackAnalyticsEvent: analyticsMocks.trackAnalyticsEvent,
}))

vi.mock('../utils/paceCoach', () => ({
  getPaceCoachInsights: () => ({
    status: 'over-pace',
    milestone: 50,
    budgetPercent: 60,
    spentThisMonth: 18000,
    remainingBudget: 12000,
    safeToSpendToday: 600,
    projectedSpend: 34000,
    daysLeft: 20,
    spentThisWeek: 4200,
    spentPreviousWeek: 3500,
    weekChangePercent: 20,
    topCategory: { id: 'food', name: 'Food & Dining', amount: 2200 },
    suggestion: {
      title: 'A small slowdown will help',
      body: 'Food & Dining leads this week.',
      action: 'details',
    },
  }),
}))

it('turns spending data into a weekly recommendation with an action', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/coach']}>
      <Routes>
        <Route path="/coach" element={<Coach />} />
        <Route path="/details" element={<div>Detailed spending</div>} />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.getByRole('heading', { name: 'Your spending pace' })).toBeInTheDocument()
  expect(screen.getByText(/600/)).toBeInTheDocument()
  expect(screen.getByText('Food & Dining leads this week at ₹2,200.')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: '50% checkpoint reached' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Take action/ }))
  expect(await screen.findByText('Detailed spending')).toBeInTheDocument()
  expect(analyticsMocks.trackAnalyticsEvent).toHaveBeenCalledWith('pace_coach_action_clicked', {
    action: 'details',
  })
})
