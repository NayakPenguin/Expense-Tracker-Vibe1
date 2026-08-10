import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'

const authState = vi.hoisted(() => ({
  user: null,
  isAuthLoading: false,
  isSigningIn: false,
  authError: null,
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendPasswordReset: vi.fn(),
  clearAuthError: vi.fn(),
  signOut: vi.fn(),
}))

const appData = vi.hoisted(() => ({
  categories: [],
  transactions: [],
  budget: { monthlyBudget: 30000 },
  hasCompletedSetup: true,
  isDataLoading: false,
  dataError: null,
  countTransactionsInCategory: () => 0,
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateBudget: vi.fn(),
  fetchTransactionsInRange: vi.fn(() => Promise.resolve([])),
  completeSetup: vi.fn(),
}))

vi.mock('./context/AuthContext', () => ({
  useAuth: () => authState,
  AuthProvider: ({ children }) => children,
}))

vi.mock('./context/AppDataContext', () => ({
  useAppData: () => appData,
  AppDataProvider: ({ children }) => children,
  FALLBACK_CATEGORY_ID: 'other',
}))

function renderRoutes(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  )
}

describe('authenticated routes', () => {
  beforeEach(() => {
    authState.user = null
    authState.isAuthLoading = false
    authState.authError = null
    appData.hasCompletedSetup = true
    appData.isDataLoading = false
    appData.dataError = null
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
    authState.user = { uid: 'u1', displayName: 'Asha Singh', email: 'asha@example.com' }
    renderRoutes('/onboarding')

    expect(await screen.findByText('Hi Asha', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('waits for Firestore before rendering an authenticated screen', () => {
    authState.user = { uid: 'u1', displayName: 'Asha Singh' }
    appData.isDataLoading = true
    renderRoutes('/')

    expect(screen.getByText('Getting your account ready…')).toBeInTheDocument()
  })

  it('surfaces unpublished security rules rather than an empty app', () => {
    authState.user = { uid: 'u1', displayName: 'Asha Singh' }
    appData.dataError = { code: 'permission-denied' }
    renderRoutes('/')

    expect(screen.getByRole('alert')).toHaveTextContent('security rules have been published')
  })
})

describe('first-run setup gate', () => {
  beforeEach(() => {
    authState.isAuthLoading = false
    authState.user = { uid: 'u1', displayName: 'Asha Singh', email: 'asha@example.com' }
    appData.isDataLoading = false
    appData.dataError = null
    appData.hasCompletedSetup = false
    appData.categories = [{ id: 'other', name: 'Other', color: 'var(--category-8)', isDefault: true }]
  })

  it('sends an account that has not finished setup to the setup flow', async () => {
    renderRoutes('/')

    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument()
  })

  it('keeps setup reachable directly until it is finished', async () => {
    renderRoutes('/setup')

    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument()
  })

  it('sends a finished account away from setup', async () => {
    appData.hasCompletedSetup = true
    renderRoutes('/setup')

    expect(await screen.findByText('Hi Asha', {}, { timeout: 5000 })).toBeInTheDocument()
  })
})
