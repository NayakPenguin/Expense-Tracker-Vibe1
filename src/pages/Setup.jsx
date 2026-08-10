import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { FALLBACK_CATEGORY_ID, useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { getCategoryIcon } from '../utils/categoryIcons'
import { nextCategoryColor } from '../utils/categoryColors'
import './Setup.css'

export default function Setup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { budget, categories, addCategory, deleteCategory, completeSetup } = useAppData()

  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState(String(budget.monthlyBudget ?? ''))
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('🏷')

  const firstName = user?.displayName?.trim().split(/\s+/)[0]

  const handleBudgetNext = () => {
    const numeric = Number(amount)
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setError('Enter an amount to continue')
      return
    }
    setError('')
    setStep(1)
  }

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      setError('Enter a category name to continue')
      return
    }
    setError('')
    await addCategory({
      name: newName.trim(),
      icon: newIcon,
      color: nextCategoryColor(categories),
    })
    setNewName('')
    setNewIcon('🏷')
  }

  const handleFinish = async () => {
    setIsSaving(true)
    try {
      await completeSetup({ monthlyBudget: Number(amount) })
      navigate('/', { replace: true })
    } catch {
      setError('We couldn’t save your setup. Check your connection and try again.')
      setIsSaving(false)
    }
  }

  return (
    <main className="setup-shell">
      <section className="setup">
        <header className="setup__top">
          {step > 0 ? (
            <button
              type="button"
              className="setup__back"
              onClick={() => setStep(0)}
              aria-label="Back to budget"
            >
              <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : null}
          <span className="setup__step-label">Step {step + 1} of 2</span>
        </header>

        {step === 0 ? (
          <>
            <div className="setup__copy">
              <p className="setup__eyebrow">Set your budget</p>
              <h1>{firstName ? `Welcome, ${firstName}` : 'Welcome'}</h1>
              <p className="setup__description">
                How much do you want to spend each month? You can change this any time from
                Profile.
              </p>
            </div>

            <div className="setup__amount-field">
              <span className="setup__amount-prefix">₹</span>
              <input
                className="setup__amount-input tabular-nums"
                type="number"
                inputMode="numeric"
                min="0"
                autoFocus
                placeholder="30000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError('')
                }}
                aria-label="Monthly budget"
              />
            </div>

            {error ? (
              <p className="setup__error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="setup__actions">
              <button type="button" className="setup__primary" onClick={handleBudgetNext}>
                Continue
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="setup__copy">
              <p className="setup__eyebrow">Choose your categories</p>
              <h1>What do you spend on?</h1>
              <p className="setup__description">
                Remove any you won’t use and add your own. Other always stays — deleted
                categories move their expenses there.
              </p>
            </div>

            <ul className="setup__categories">
              {categories.map((cat) => {
                const CategoryIcon = getCategoryIcon(cat.id)
                const isFallback = cat.id === FALLBACK_CATEGORY_ID
                return (
                  <li key={cat.id} className="setup__category">
                    <span className="setup__category-swatch" style={{ background: cat.color }}>
                      {cat.isDefault ? (
                        <CategoryIcon size={15} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        cat.icon
                      )}
                    </span>
                    <span className="setup__category-name">{cat.name}</span>
                    {isFallback ? (
                      <span className="setup__category-locked">Always on</span>
                    ) : (
                      <button
                        type="button"
                        className="setup__category-remove"
                        onClick={() => deleteCategory(cat.id)}
                        aria-label={`Remove ${cat.name}`}
                      >
                        <X size={15} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="setup__add">
              <div className="setup__add-row">
                <input
                  className="setup__icon-input"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  maxLength={2}
                  aria-label="New category icon"
                />
                <input
                  className="setup__name-input"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setError('')
                  }}
                  placeholder="Add your own"
                  aria-label="New category name"
                />
                <button
                  type="button"
                  className="setup__add-button"
                  onClick={handleAddCategory}
                  aria-label="Add category"
                >
                  <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>

            {error ? (
              <p className="setup__error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="setup__actions">
              <button
                type="button"
                className="setup__primary"
                onClick={handleFinish}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Start tracking'}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
