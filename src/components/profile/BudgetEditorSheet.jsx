import { useEffect, useState } from 'react'
import Sheet from '../shared/Sheet'
import { useAppData } from '../../context/AppDataContext'
import './BudgetEditorSheet.css'

export default function BudgetEditorSheet({ open, onClose }) {
  const { budget, updateBudget } = useAppData()
  const [value, setValue] = useState(String(budget.monthlyBudget))
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValue(String(budget.monthlyBudget))
      setError('')
    }
  }, [open, budget.monthlyBudget])

  const handleSave = () => {
    const amount = Number(value)
    if (!value || Number.isNaN(amount) || amount <= 0) {
      setError('Enter an amount to continue')
      return
    }
    updateBudget(amount)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Monthly budget">
      <div className="budget-editor">
        <label className="budget-editor__label" htmlFor="budget-amount">
          Monthly budget
        </label>
        <div className="budget-editor__input-wrap">
          <span className="budget-editor__prefix">₹</span>
          <input
            id="budget-amount"
            className="budget-editor__input"
            type="number"
            inputMode="numeric"
            min="0"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            placeholder="30000"
          />
        </div>
        {error ? <p className="budget-editor__error">{error}</p> : null}
        <button type="button" className="budget-editor__save" onClick={handleSave}>
          Save budget
        </button>
      </div>
    </Sheet>
  )
}
