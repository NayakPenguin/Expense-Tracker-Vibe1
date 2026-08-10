import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppDataProvider, useAppData } from './AppDataContext'

const authState = vi.hoisted(() => ({ user: null }))

const dbMocks = vi.hoisted(() => ({
  ensureUserDocument: vi.fn(),
  subscribeToUserData: vi.fn(),
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

vi.mock('./AuthContext', () => ({ useAuth: () => authState }))

vi.mock('../lib/db', () => ({
  FALLBACK_CATEGORY_ID: 'other',
  DEFAULT_BUDGET: { monthlyBudget: 30000 },
  ...dbMocks,
}))

/** Drives the three snapshot callbacks the provider subscribes with. */
let emit = null

function Harness() {
  const {
    categories,
    transactions,
    budget,
    isDataLoading,
    hasCompletedSetup,
    deleteCategory,
    countTransactionsInCategory,
  } = useAppData()

  if (isDataLoading) return <span>loading</span>

  return (
    <div>
      <span data-testid="budget">{budget.monthlyBudget}</span>
      <span data-testid="setup">{hasCompletedSetup ? 'done' : 'pending'}</span>
      <span data-testid="categories">{categories.map((c) => c.id).join(',')}</span>
      <span data-testid="transactions">{transactions.map((t) => t.id).join(',')}</span>
      <span data-testid="food-count">{countTransactionsInCategory('food')}</span>
      <button type="button" onClick={() => deleteCategory('food')}>delete food</button>
    </div>
  )
}

function renderApp() {
  return render(
    <AppDataProvider>
      <Harness />
    </AppDataProvider>
  )
}

/** Pushes a full set of snapshots, which is what clears the loading state. */
function emitAll({ settings, categories = [], transactions = [] }) {
  emit.onSettings(settings)
  emit.onCategories(categories)
  emit.onTransactions(transactions)
}

describe('AppDataProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { uid: 'user-a', displayName: 'Asha', email: 'asha@example.com' }
    dbMocks.ensureUserDocument.mockResolvedValue({ isNewUser: false, hasCompletedSetup: true })
    dbMocks.subscribeToUserData.mockImplementation((_uid, handlers) => {
      emit = handlers
      return vi.fn()
    })
  })

  it('subscribes to the signed-in account and nothing else', async () => {
    renderApp()

    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())
    expect(dbMocks.subscribeToUserData.mock.calls[0][0]).toBe('user-a')
    expect(dbMocks.ensureUserDocument).toHaveBeenCalledWith('user-a', {
      displayName: 'Asha',
      email: 'asha@example.com',
    })
  })

  it('stays loading until every collection has reported', async () => {
    renderApp()
    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())

    emit.onSettings({ monthlyBudget: 45000, hasCompletedSetup: true })
    emit.onCategories([{ id: 'food' }])
    expect(screen.getByText('loading')).toBeInTheDocument()

    emit.onTransactions([])
    expect(await screen.findByTestId('budget')).toHaveTextContent('45000')
  })

  it('reports setup as pending for a brand-new account', async () => {
    dbMocks.ensureUserDocument.mockResolvedValue({ isNewUser: true, hasCompletedSetup: false })
    renderApp()
    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())

    emitAll({ settings: { monthlyBudget: 30000, hasCompletedSetup: false } })

    expect(await screen.findByTestId('setup')).toHaveTextContent('pending')
  })

  it('counts a category from the live transactions already in memory', async () => {
    renderApp()
    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())

    emitAll({
      settings: { monthlyBudget: 30000, hasCompletedSetup: true },
      categories: [{ id: 'food' }, { id: 'other' }],
      transactions: [
        { id: 't1', categoryId: 'food' },
        { id: 't2', categoryId: 'food' },
        { id: 't3', categoryId: 'other' },
      ],
    })

    expect(await screen.findByTestId('food-count')).toHaveTextContent('2')
  })

  it('delegates category deletion to the uid-scoped writer', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())
    emitAll({ settings: { monthlyBudget: 30000, hasCompletedSetup: true } })

    await user.click(await screen.findByRole('button', { name: 'delete food' }))

    expect(dbMocks.deleteCategory).toHaveBeenCalledWith('user-a', 'food')
  })

  it('does not touch Firestore while signed out', async () => {
    authState.user = null
    renderApp()

    await waitFor(() => expect(screen.getByTestId('budget')).toBeInTheDocument())
    expect(dbMocks.ensureUserDocument).not.toHaveBeenCalled()
    expect(dbMocks.subscribeToUserData).not.toHaveBeenCalled()
  })

  it('falls back to the default budget before settings arrive', async () => {
    renderApp()
    await waitFor(() => expect(dbMocks.subscribeToUserData).toHaveBeenCalled())

    emitAll({ settings: null })

    expect(await screen.findByTestId('budget')).toHaveTextContent('30000')
  })
})
