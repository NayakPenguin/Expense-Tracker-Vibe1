import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Sheet from '../shared/Sheet'
import { useAppData } from '../../context/AppDataContext'
import { getCategoryIcon } from '../../utils/categoryIcons'
import { todayISO } from '../../utils/dates'
import './AddExpenseSheet.css'

/**
 * One sheet for both creating and correcting an expense — the fields are
 * identical, and keeping them in one component means validation and copy can't
 * drift between the two paths. `transaction` being present is what puts it in
 * edit mode.
 */
export default function AddExpenseSheet({ open, onClose, transaction = null }) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useAppData()

  const isEditing = Boolean(transaction)

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [merchant, setMerchant] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // The sheet stays mounted between openings, so the form has to be re-seeded
  // each time rather than relying on initial state.
  useEffect(() => {
    if (!open) return

    setAmount(transaction ? String(transaction.amount) : '')
    setCategoryId(transaction?.categoryId ?? categories[0]?.id ?? '')
    setMerchant(transaction?.merchant ?? '')
    setNote(transaction?.note ?? '')
    setDate(transaction?.date ?? todayISO())
    setError('')
    setConfirmingDelete(false)
    setIsSaving(false)
    // categories is intentionally excluded: re-seeding on a category edit would
    // discard whatever the user has already typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  const handleClose = () => {
    setConfirmingDelete(false)
    onClose()
  }

  const handleSubmit = async () => {
    const numericAmount = Number(amount)
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount to continue')
      return
    }
    if (!categoryId) {
      setError('Choose a category to continue')
      return
    }

    const category = categories.find((c) => c.id === categoryId)
    const payload = {
      categoryId,
      merchant: merchant.trim() || category?.name || 'Expense',
      note: note.trim() || null,
      date,
      amount: numericAmount,
    }

    setIsSaving(true)
    try {
      if (isEditing) {
        await updateTransaction(transaction.id, payload)
      } else {
        await addTransaction({ ...payload, direction: 'debit' })
      }
      onClose()
    } catch {
      setError('We couldn’t save this expense. Check your connection and try again.')
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      await deleteTransaction(transaction.id)
      onClose()
    } catch {
      setError('We couldn’t delete this expense. Check your connection and try again.')
      setIsSaving(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Edit expense' : 'Add expense'}
    >
      <div className="add-expense">
        <div className="add-expense__field">
          <label className="add-expense__label" htmlFor="expense-amount">
            Amount
          </label>
          <div className="add-expense__amount-wrap">
            <span className="add-expense__prefix">₹</span>
            <input
              id="expense-amount"
              className="add-expense__amount-input"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError('')
              }}
            />
          </div>
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label">Category</label>
          <div className="add-expense__categories">
            {categories.map((cat) => {
              const CategoryIcon = getCategoryIcon(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={
                    'add-expense__category' +
                    (cat.id === categoryId ? ' add-expense__category--active' : '')
                  }
                  onClick={() => setCategoryId(cat.id)}
                >
                  <CategoryIcon size={16} strokeWidth={2} aria-hidden="true" />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label" htmlFor="expense-merchant">
            Where
          </label>
          <input
            id="expense-merchant"
            className="add-expense__input"
            type="text"
            placeholder="Defaults to the category name"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label" htmlFor="expense-note">
            Note (optional)
          </label>
          <input
            id="expense-note"
            className="add-expense__input"
            type="text"
            placeholder="e.g. Team lunch"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label" htmlFor="expense-date">
            Date
          </label>
          <input
            id="expense-date"
            className="add-expense__input"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {error ? <p className="add-expense__error">{error}</p> : null}

        <button
          type="button"
          className="add-expense__submit"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isEditing ? 'Save changes' : 'Add expense'}
        </button>

        {isEditing ? (
          confirmingDelete ? (
            <div className="add-expense__confirm">
              <p className="add-expense__confirm-text">
                Delete this expense? This can’t be undone.
              </p>
              <div className="add-expense__confirm-actions">
                <button
                  type="button"
                  className="add-expense__confirm-cancel"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Keep
                </button>
                <button
                  type="button"
                  className="add-expense__confirm-delete"
                  onClick={handleDelete}
                  disabled={isSaving}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="add-expense__delete"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
              Delete expense
            </button>
          )
        ) : null}
      </div>
    </Sheet>
  )
}
