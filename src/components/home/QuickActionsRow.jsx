import { Plus, Target, Tag } from 'lucide-react'
import './QuickActionsRow.css'

export default function QuickActionsRow({ onAdd, onUpdateBudget, onUpdateCategories }) {
  return (
    <div className="quick-actions-row">
      <button
        type="button"
        className="quick-actions-row__button"
        onClick={onAdd}
      >
        <Plus size={20} strokeWidth={2.25} aria-hidden="true" />
        Add
      </button>
      <button
        type="button"
        className="quick-actions-row__button"
        onClick={onUpdateBudget}
      >
        <Target size={20} strokeWidth={2} aria-hidden="true" />
        Update budget
      </button>
      <button
        type="button"
        className="quick-actions-row__button"
        onClick={onUpdateCategories}
      >
        <Tag size={20} strokeWidth={2} aria-hidden="true" />
        Update categories
      </button>
    </div>
  )
}
