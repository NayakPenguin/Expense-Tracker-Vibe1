import { render as rtlRender, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Onboarding from './Onboarding'

const authState = vi.hoisted(() => ({
  authError: null,
  isSigningIn: false,
  signInWithGoogle: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState }))

// Onboarding links to /signin, so it needs a router in scope.
function render(ui) {
  return rtlRender(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Onboarding', () => {
  beforeEach(() => {
    authState.authError = null
    authState.isSigningIn = false
    authState.signInWithGoogle.mockReset()
  })

  it('moves forward and backward through all three steps', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    expect(screen.getByRole('heading', { name: 'Track every expense' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'See the patterns' })).toBeInTheDocument()
    expect(screen.getByLabelText('Step 2 of 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'Track every expense' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Stay on budget' })).toBeInTheDocument()
  })

  it('starts Google sign-in from the final step', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(authState.signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('offers the email route only on the final step', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)

    expect(screen.queryByRole('link', { name: 'Use email instead' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('link', { name: 'Use email instead' })).toHaveAttribute(
      'href',
      '/signin'
    )
  })

  it('shows auth errors and disables sign-in while redirecting', async () => {
    authState.authError = 'This domain is not authorized in Firebase Authentication.'
    authState.isSigningIn = true
    const user = userEvent.setup()
    render(<Onboarding />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('alert')).toHaveTextContent('not authorized')
    expect(screen.getByRole('button', { name: 'Connecting to Google…' })).toBeDisabled()
  })
})
