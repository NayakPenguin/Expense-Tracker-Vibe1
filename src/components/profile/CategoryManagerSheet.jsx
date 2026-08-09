import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import Sheet from '../shared/Sheet'
import { useAppData } from '../../context/AppDataContext'
import { getCategoryIcon } from '../../utils/categoryIcons'
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

const PALETTE = [
  'var(--category-1)',
  'var(--category-2)',
  'var(--category-3)',
  'var(--category-4)',
  'var(--category-5)',
  'var(--category-6)',
  'var(--category-7)',
  'var(--category-8)',
]

export default function CategoryManagerSheet({ open, onClose }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppData()
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏷')
  const [color, setColor] = useState(PALETTE[0])
  const [error, setError] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setIcon('🏷')
    setColor(PALETTE[0])
    setError('')
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setName(category.name)
    setIcon(category.icon)
    setColor(category.color)
    setError('')
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Enter a category name to continue')
      return
    }
    if (editingId) {
      updateCategory(editingId, { name: name.trim(), icon, color })
    } else {
      addCategory({ name: name.trim(), icon, color })
    }
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Categories">
      <ul className="category-manager__list">
        {categories.map((cat) => {
          const isDefault = DEFAULT_CATEGORY_IDS.has(cat.id)
          const CategoryIcon = isDefault ? getCategoryIcon(cat.id) : null
          return (
            <li key={cat.id} className="category-manager__row">
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
              <button
                type="button"
                className="category-manager__action category-manager__action--danger"
                onClick={() => deleteCategory(cat.id)}
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
              </button>
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
        <div className="category-manager__palette">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={
                'category-manager__palette-dot' +
                (swatch === color ? ' category-manager__palette-dot--active' : '')
              }
              style={{ background: swatch }}
              onClick={() => setColor(swatch)}
              aria-label={`Choose color ${swatch}`}
            />
          ))}
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
