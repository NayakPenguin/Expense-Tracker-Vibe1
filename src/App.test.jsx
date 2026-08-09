import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDataProvider } from './context/AppDataContext'
import { AppRoutes } from './App'

const authState = vi.hoisted(() => ({
  user: null,
  isAuthLoading: false,
  isSigningIn: false,
  authError: null,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('./context/AuthContext', () => ({
  useAuth: () => authState,
  AuthProvider: ({ children }) => children,
}))

function renderRoutes(path) {
  return render(
    <AppDataProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppDataProvider>
  )
}

describe('authenticated routes', () => {
  beforeEach(() => {
    authState.user = null
    authState.isAuthLoading = false
    authState.authError = null
  })

  it('shows only the auth loading screen while restoring a session', () => {
    authState.isAuthLoading = true
    renderRoutes('/')

    expect(screen.getByText('Getting your account ready…')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('redirects a signed-out protected route to onboarding', async () => {
    renderRoutes('/profile')

    expect(await screen.findByRole('heading', { name: 'Track every expense' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('redirects an authenticated user away from onboarding', async () => {
    authState.user = { displayName: 'Asha Singh', email: 'asha@example.com' }
    renderRoutes('/onboarding')

    expect(await screen.findByText('Hi Asha', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })
})
