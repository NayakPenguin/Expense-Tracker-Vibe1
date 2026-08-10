import { render as rtlRender, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignIn from './SignIn'

const authState = vi.hoisted(() => ({
  authError: null,
  isSigningIn: false,
  clearAuthError: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  sendPasswordReset: vi.fn(),
}))

const navigate = vi.hoisted(() => vi.fn())

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

function render() {
  return rtlRender(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  )
}

async function fill(user, label, value) {
  await user.type(screen.getByLabelText(label), value)
}

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.authError = null
    authState.isSigningIn = false
    authState.signInWithEmail.mockResolvedValue(undefined)
    authState.signUpWithEmail.mockResolvedValue(undefined)
    authState.sendPasswordReset.mockResolvedValue(undefined)
  })

  it('signs in with email and password', async () => {
    const user = userEvent.setup()
    render()

    await fill(user, 'Email', 'asha@example.com')
    await fill(user, 'Password', 'hunter22')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(authState.signInWithEmail).toHaveBeenCalledWith({
      email: 'asha@example.com',
      password: 'hunter22',
    })
    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('collects a name when creating an account', async () => {
    const user = userEvent.setup()
    render()

    await user.click(screen.getByRole('tab', { name: 'Create account' }))
    await fill(user, 'Name', 'Asha Singh')
    await fill(user, 'Email', 'asha@example.com')
    await fill(user, 'Password', 'hunter22')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(authState.signUpWithEmail).toHaveBeenCalledWith({
      name: 'Asha Singh',
      email: 'asha@example.com',
      password: 'hunter22',
    })
  })

  it('asks for a name before creating an account', async () => {
    const user = userEvent.setup()
    render()

    await user.click(screen.getByRole('tab', { name: 'Create account' }))
    await fill(user, 'Email', 'asha@example.com')
    await fill(user, 'Password', 'hunter22')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your name to continue')
    expect(authState.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('rejects a short password before calling Firebase', async () => {
    const user = userEvent.setup()
    render()

    await user.click(screen.getByRole('tab', { name: 'Create account' }))
    await fill(user, 'Name', 'Asha')
    await fill(user, 'Email', 'asha@example.com')
    await fill(user, 'Password', 'abc')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('at least 6 characters')
    expect(authState.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('needs an email before sending a reset link', async () => {
    const user = userEvent.setup()
    render()

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email first')
    expect(authState.sendPasswordReset).not.toHaveBeenCalled()
  })

  it('confirms once a reset link is sent', async () => {
    const user = userEvent.setup()
    render()

    await fill(user, 'Email', 'asha@example.com')
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))

    expect(authState.sendPasswordReset).toHaveBeenCalledWith('asha@example.com')
    expect(await screen.findByRole('status')).toHaveTextContent('asha@example.com')
  })

  it('surfaces auth errors from the provider', () => {
    authState.authError = 'That email already has an account. Sign in instead.'
    render()

    expect(screen.getByRole('alert')).toHaveTextContent('already has an account')
  })

  it('keeps Google sign-in available', async () => {
    const user = userEvent.setup()
    render()

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(authState.signInWithGoogle).toHaveBeenCalledTimes(1)
  })
})
