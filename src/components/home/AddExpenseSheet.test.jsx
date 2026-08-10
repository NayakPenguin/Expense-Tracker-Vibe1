import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddExpenseSheet from './AddExpenseSheet'

const appData = vi.hoisted(() => ({
  categories: [
    { id: 'food', name: 'Food & Dining', color: 'var(--category-1)' },
    { id: 'other', name: 'Other', color: 'var(--category-8)' },
  ],
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

vi.mock('../../context/AppDataContext', () => ({ useAppData: () => appData }))

const existing = {
  id: 't1',
  categoryId: 'food',
  merchant: 'Zomato',
  note: 'Late dinner',
  date: '2026-08-04',
  amount: 220,
  direction: 'debit',
}

describe('AddExpenseSheet — creating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    appData.addTransaction.mockResolvedValue(undefined)
  })

  it('creates a debit from an empty form', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Amount'), '450')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(appData.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 450, categoryId: 'food', direction: 'debit' })
    )
  })

  it('falls back to the category name when no merchant is given', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Amount'), '120')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))

    expect(appData.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ merchant: 'Food & Dining' })
    )
  })

  it('offers no delete action when there is nothing to delete', () => {
    render(<AddExpenseSheet open onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /Delete expense/ })).not.toBeInTheDocument()
  })
})

describe('AddExpenseSheet — editing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    appData.updateTransaction.mockResolvedValue(undefined)
    appData.deleteTransaction.mockResolvedValue(undefined)
  })

  it('opens prefilled from the selected transaction', () => {
    render(<AddExpenseSheet open onClose={vi.fn()} transaction={existing} />)

    expect(screen.getByLabelText('Amount')).toHaveValue(220)
    expect(screen.getByLabelText('Where')).toHaveValue('Zomato')
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('Late dinner')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-08-04')
    expect(screen.getByRole('heading', { name: 'Edit expense' })).toBeInTheDocument()
  })

  it('saves an edit against the original id', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} transaction={existing} />)

    const amount = screen.getByLabelText('Amount')
    await user.clear(amount)
    await user.type(amount, '260')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(appData.updateTransaction).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ amount: 260, merchant: 'Zomato' })
    )
    expect(appData.addTransaction).not.toHaveBeenCalled()
  })

  it('requires a confirmation before deleting', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} transaction={existing} />)

    await user.click(screen.getByRole('button', { name: /Delete expense/ }))
    expect(appData.deleteTransaction).not.toHaveBeenCalled()
    expect(screen.getByText(/can’t be undone/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(appData.deleteTransaction).toHaveBeenCalledWith('t1')
  })

  it('backs out of a delete without touching the record', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} transaction={existing} />)

    await user.click(screen.getByRole('button', { name: /Delete expense/ }))
    await user.click(screen.getByRole('button', { name: 'Keep' }))

    expect(appData.deleteTransaction).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Delete expense/ })).toBeInTheDocument()
  })

  it('keeps the sheet open and explains a failed save', async () => {
    appData.updateTransaction.mockRejectedValue(new Error('offline'))
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={onClose} transaction={existing} />)

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText(/couldn’t save this expense/)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('rejects an amount of zero', async () => {
    const user = userEvent.setup()
    render(<AddExpenseSheet open onClose={vi.fn()} transaction={existing} />)

    const amount = screen.getByLabelText('Amount')
    await user.clear(amount)
    await user.type(amount, '0')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByText('Enter an amount to continue')).toBeInTheDocument()
    expect(appData.updateTransaction).not.toHaveBeenCalled()
  })
})
