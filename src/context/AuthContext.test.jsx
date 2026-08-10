import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AuthProvider,
  getAuthErrorMessage,
  getEmailAuthErrorMessage,
  useAuth,
} from './AuthContext'

const firebaseMocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  signInWithPopup: vi.fn(),
  firebaseSignOut: vi.fn(),
  setCustomParameters: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
}))

vi.mock('../lib/firebase', () => ({ auth: { name: 'test-auth' } }))

vi.mock('firebase/auth', () => ({
  browserLocalPersistence: { name: 'local' },
  GoogleAuthProvider: class {
    setCustomParameters = firebaseMocks.setCustomParameters
  },
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
  setPersistence: firebaseMocks.setPersistence,
  signInWithPopup: firebaseMocks.signInWithPopup,
  signOut: firebaseMocks.firebaseSignOut,
  createUserWithEmailAndPassword: firebaseMocks.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: firebaseMocks.signInWithEmailAndPassword,
  sendPasswordResetEmail: firebaseMocks.sendPasswordResetEmail,
  updateProfile: firebaseMocks.updateProfile,
  signInWithRedirect: firebaseMocks.signInWithRedirect,
  getRedirectResult: firebaseMocks.getRedirectResult,
}))

function AuthHarness() {
  const {
    user,
    isAuthLoading,
    isSigningIn,
    authError,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
  } = useAuth()
  return (
    <div>
      <span>{isAuthLoading ? 'loading' : user?.email || 'signed-out'}</span>
      <span data-testid="display-name">{user?.displayName || 'no-name'}</span>
      {authError ? <span role="alert">{authError}</span> : null}
      <button type="button" onClick={signInWithGoogle} disabled={isSigningIn}>sign in</button>
      <button
        type="button"
        onClick={() =>
          signUpWithEmail({
            name: 'Asha Singh',
            email: 'asha@example.com',
            password: 'hunter22',
          }).catch(() => {})
        }
      >
        sign up
      </button>
      <button type="button" onClick={signOut}>sign out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    firebaseMocks.setPersistence.mockResolvedValue(undefined)
    firebaseMocks.getRedirectResult.mockResolvedValue(null)
    firebaseMocks.signInWithPopup.mockResolvedValue({
      user: { email: 'signed-in@example.com' },
    })
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

  it('sets local persistence before opening Google sign-in', async () => {
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign in' }))

    expect(firebaseMocks.setPersistence).toHaveBeenCalledTimes(1)
    expect(firebaseMocks.signInWithPopup).toHaveBeenCalledTimes(1)
    expect(firebaseMocks.setPersistence.mock.invocationCallOrder[0])
      .toBeLessThan(firebaseMocks.signInWithPopup.mock.invocationCallOrder[0])
    expect(firebaseMocks.setCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' })
    expect(await screen.findByText('signed-in@example.com')).toBeInTheDocument()
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

  it('falls back to redirect when the browser blocks the popup', async () => {
    // In-app browsers block popups outright, which would otherwise dead-end
    // sign-in on exactly the phones this app targets.
    firebaseMocks.signInWithPopup.mockRejectedValue({ code: 'auth/popup-blocked' })
    firebaseMocks.signInWithRedirect.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign in' }))

    expect(firebaseMocks.signInWithRedirect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not redirect when the user simply closed the popup', async () => {
    firebaseMocks.signInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign in' }))

    expect(firebaseMocks.signInWithRedirect).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('closed before login finished')
  })

  it('completes a sign-in that came back through a redirect', async () => {
    firebaseMocks.getRedirectResult.mockResolvedValue({
      user: { email: 'redirected@example.com' },
    })
    render(<AuthProvider><AuthHarness /></AuthProvider>)

    expect(await screen.findByText('redirected@example.com')).toBeInTheDocument()
  })
})

describe('email sign-up', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    firebaseMocks.setPersistence.mockResolvedValue(undefined)
    firebaseMocks.getRedirectResult.mockResolvedValue(null)
    firebaseMocks.updateProfile.mockResolvedValue(undefined)
    firebaseMocks.onAuthStateChanged.mockImplementation((_auth, next) => {
      next(null)
      return vi.fn()
    })
  })

  it('writes the display name onto the new account', async () => {
    // A fresh email account has no displayName, so the Home greeting and the
    // Profile header would both fall back to placeholder copy without this.
    const newUser = { email: 'asha@example.com', displayName: null }
    firebaseMocks.createUserWithEmailAndPassword.mockImplementation(async () => {
      firebaseMocks.updateProfile.mockImplementation(async (target, profile) => {
        target.displayName = profile.displayName
      })
      return { user: newUser }
    })

    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign up' }))

    expect(firebaseMocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      { name: 'test-auth' },
      'asha@example.com',
      'hunter22'
    )
    expect(firebaseMocks.updateProfile).toHaveBeenCalledWith(newUser, {
      displayName: 'Asha Singh',
    })
    expect(await screen.findByTestId('display-name')).toHaveTextContent('Asha Singh')
  })

  it('reports a duplicate email without leaking whether it exists elsewhere', async () => {
    firebaseMocks.createUserWithEmailAndPassword.mockRejectedValue({
      code: 'auth/email-already-in-use',
    })

    const user = userEvent.setup()
    render(<AuthProvider><AuthHarness /></AuthProvider>)
    await screen.findByText('signed-out')

    await user.click(screen.getByRole('button', { name: 'sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('already has an account')
  })
})

describe('getEmailAuthErrorMessage', () => {
  it('gives one vague message for wrong password and unknown email alike', () => {
    // Firebase collapses both into invalid-credential when enumeration
    // protection is on; the copy must not distinguish them either.
    const expected = 'That email and password don’t match an account. Check both and try again.'
    expect(getEmailAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe(expected)
    expect(getEmailAuthErrorMessage({ code: 'auth/wrong-password' })).toBe(expected)
    expect(getEmailAuthErrorMessage({ code: 'auth/user-not-found' })).toBe(expected)
  })

  it('names the fix for a weak password', () => {
    expect(getEmailAuthErrorMessage({ code: 'auth/weak-password' }))
      .toContain('at least 6 characters')
  })

  it('falls back to a generic message for unknown codes', () => {
    expect(getEmailAuthErrorMessage({ code: 'auth/some-new-code' }))
      .toBe('Something went wrong. Please try again.')
  })
})
