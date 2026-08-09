import { useState } from 'react'
import Sheet from '../shared/Sheet'
import { useAppData } from '../../context/AppDataContext'
import { getCategoryIcon } from '../../utils/categoryIcons'
import './AddExpenseSheet.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function AddExpenseSheet({ open, onClose }) {
  const { categories, addTransaction } = useAppData()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  const resetForm = () => {
    setAmount('')
    setCategoryId(categories[0]?.id ?? '')
    setNote('')
    setDate(todayISO())
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
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
    addTransaction({
      categoryId,
      merchant: category ? category.name : 'Expense',
      note: note.trim() || null,
      date,
      amount: numericAmount,
      direction: 'debit',
    })
    resetForm()
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Add expense">
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

        <button type="button" className="add-expense__submit" onClick={handleSubmit}>
          Add expense
        </button>
      </div>
    </Sheet>
  )
}
