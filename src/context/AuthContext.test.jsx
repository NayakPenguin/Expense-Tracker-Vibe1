import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, getAuthErrorMessage, useAuth } from './AuthContext'

const firebaseMocks = vi.hoisted(() => ({
  getRedirectResult: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  signInWithRedirect: vi.fn(),
  firebaseSignOut: vi.fn(),
  setCustomParameters: vi.fn(),
}))

vi.mock('../lib/firebase', () => ({ auth: { name: 'test-auth' } }))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: { name: 'local' },
  getRedirectResult: firebaseMocks.getRedirectResult,
  GoogleAuthProvider: class {
    setCustomParameters = firebaseMocks.setCustomParameters
  },
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
  setPersistence: firebaseMocks.setPersistence,
  signInWithRedirect: firebaseMocks.signInWithRedirect,
  signOut: firebaseMocks.firebaseSignOut,
}))

function AuthHarness() {
  const { user, isAuthLoading, isSigningIn, authError, signInWithGoogle, signOut } = useAuth()
  return (
    <div>
      <span>{isAuthLoading ? 'loading' : user?.email || 'signed-out'}</span>
      {authError ? <span role="alert">{authError}</span> : null}
      <button type="button" onClick={signInWithGoogle} disabled={isSigningIn}>sign in</button>
      <button type="button" onClick={signOut}>sign out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    firebaseMocks.getRedirectResult.mockResolvedValue(null)
    firebaseMocks.setPersistence.mockResolvedValue(undefined)
    firebaseMocks.signInWithRedirect.mockResolvedValue(undefined)
    firebaseMocks.firebaseSignOut.mockResolvedValue(undefined)
    firebaseMocks.onAuthStateChanged.mockImplementation((_auth, next) => {
      next(null)
      return vi.fn()
    })
  })

  it('observes and exposes the restored user', async () => {
    firebaseMocks.onAuthStateChanged.mockImplementation((_auth, next) => {
      next({ email: 'asha@example.com' })
      return vi.fn()
    })
    render(<AuthProvider><AuthHarness /></AuthProvider>)

    expect(await screen.findByText('asha@example.com')).toBeInTheDocument()
  })

  it('sets local persistence before starting the Google redirect', async () => {
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign in' }))

    expect(firebaseMocks.setPersistence).toHaveBeenCalledTimes(1)
    expect(firebaseMocks.signInWithRedirect).toHaveBeenCalledTimes(1)
    expect(firebaseMocks.setPersistence.mock.invocationCallOrder[0])
      .toBeLessThan(firebaseMocks.signInWithRedirect.mock.invocationCallOrder[0])
    expect(firebaseMocks.setCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' })
  })

  it('surfaces a retryable sign-in failure', async () => {
    firebaseMocks.setPersistence.mockRejectedValue({ code: 'auth/network-request-failed' })
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('internet connection')
    await waitFor(() => expect(screen.getByRole('button', { name: 'sign in' })).toBeEnabled())
  })

  it('signs out through Firebase', async () => {
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign out' }))
    expect(firebaseMocks.firebaseSignOut).toHaveBeenCalledTimes(1)
  })

  it('explains when Firebase Authentication has not been initialized', () => {
    expect(getAuthErrorMessage({ code: 'auth/configuration-not-found' }))
      .toContain('click Get started, and enable Google')
  })
})
