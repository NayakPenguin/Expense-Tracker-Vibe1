import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import PaceCoachCard from './PaceCoachCard'

const analyticsMocks = vi.hoisted(() => ({ trackAnalyticsEvent: vi.fn() }))
vi.mock('../../lib/firebase', () => ({
  trackAnalyticsEvent: analyticsMocks.trackAnalyticsEvent,
}))

const insights = {
  status: 'on-track',
  safeToSpendToday: 1000,
  projectedSpend: 28000,
  suggestion: { body: 'You are moving at a comfortable pace.' },
}

it('shows useful headline guidance and opens the detailed coach', async () => {
  const onOpen = vi.fn()
  const user = userEvent.setup()
  render(<PaceCoachCard insights={insights} onOpen={onOpen} />)

  expect(screen.getByText('Safe to spend today')).toBeInTheDocument()
  expect(screen.getByText(/1,000/)).toBeInTheDocument()
  expect(screen.getByText(/28,000/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'View weekly insights' }))
  expect(onOpen).toHaveBeenCalledTimes(1)
  expect(analyticsMocks.trackAnalyticsEvent).toHaveBeenCalledWith('pace_coach_opened', {
    source: 'home',
    status: 'on-track',
  })
})
