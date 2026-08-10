import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Sheet from '../shared/Sheet'
import { FALLBACK_CATEGORY_ID, useAppData } from '../../context/AppDataContext'
import { getCategoryIcon } from '../../utils/categoryIcons'
import { nextCategoryColor } from '../../utils/categoryColors'
import './CategoryManagerSheet.css'

const DEFAULT_CATEGORY_IDS = new Set([
  'food',
  'transport',
  'shopping',
  'health',
  'bills',
  'entertainment',
  'personal',
  'other',
])

function deleteWarning(count) {
  if (count === 0) return 'No expenses use this category.'
  if (count === 1) return '1 expense moves to Other.'
  return `${count} expenses move to Other.`
}

export default function CategoryManagerSheet({ open, onClose }) {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    countTransactionsInCategory,
  } = useAppData()
  const [editingId, setEditingId] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏷')
  const [error, setError] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setIcon('🏷')
    setError('')
  }

  const confirmDelete = (id) => {
    deleteCategory(id)
    setPendingDeleteId(null)
    if (editingId === id) resetForm()
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setPendingDeleteId(null)
    setName(category.name)
    setIcon(category.icon)
    setError('')
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Enter a category name to continue')
      return
    }
    if (editingId) {
      // Colour is assigned once at creation and never re-picked, so an edit
      // must not disturb it — a category keeps the same colour everywhere.
      updateCategory(editingId, { name: name.trim(), icon })
    } else {
      addCategory({ name: name.trim(), icon, color: nextCategoryColor(categories) })
    }
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    setPendingDeleteId(null)
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Categories">
      <ul className="category-manager__list">
        {categories.map((cat) => {
          const isDefault = DEFAULT_CATEGORY_IDS.has(cat.id)
          const CategoryIcon = isDefault ? getCategoryIcon(cat.id) : null
          const isFallback = cat.id === FALLBACK_CATEGORY_ID
          const isConfirming = pendingDeleteId === cat.id
          return (
            <li
              key={cat.id}
              className={
                'category-manager__row' +
                (isConfirming ? ' category-manager__row--confirming' : '')
              }
            >
              <div className="category-manager__row-main">
                <span
                  className="category-manager__swatch"
                  style={{ background: cat.color }}
                >
                  {CategoryIcon ? (
                    <CategoryIcon size={16} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    cat.icon
                  )}
                </span>
                <span className="category-manager__name">{cat.name}</span>
                <button
                  type="button"
                  className="category-manager__action"
                  onClick={() => startEdit(cat)}
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                </button>
                {/* Other is where deleted categories' expenses land, so it stays. */}
                {isFallback ? null : (
                  <button
                    type="button"
                    className="category-manager__action category-manager__action--danger"
                    onClick={() => setPendingDeleteId(cat.id)}
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>

              {isConfirming ? (
                <div className="category-manager__confirm">
                  <p className="category-manager__confirm-text">
                    Delete {cat.name}? {deleteWarning(countTransactionsInCategory(cat.id))}
                  </p>
                  <div className="category-manager__confirm-actions">
                    <button
                      type="button"
                      className="category-manager__confirm-cancel"
                      onClick={() => setPendingDeleteId(null)}
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      className="category-manager__confirm-delete"
                      onClick={() => confirmDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="category-manager__form">
        <p className="category-manager__form-title">
          {editingId ? 'Edit category' : 'Add category'}
        </p>
        <div className="category-manager__form-row">
          <input
            className="category-manager__icon-input"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={2}
            aria-label="Category icon"
          />
          <input
            className="category-manager__name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Category name"
            aria-label="Category name"
          />
        </div>
        {error ? <p className="category-manager__error">{error}</p> : null}
        <div className="category-manager__form-actions">
          {editingId ? (
            <button type="button" className="category-manager__cancel" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
          <button type="button" className="category-manager__save" onClick={handleSave}>
            {editingId ? 'Save changes' : 'Add category'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
