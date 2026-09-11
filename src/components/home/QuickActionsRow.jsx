import { PencilLine, Plus, Tag } from 'lucide-react'
import './QuickActionsRow.css'

export default function QuickActionsRow({ onAdd, onUpdateBudget, onUpdateCategories }) {
  return (
    <section className="quick-actions">
      <h2 className="quick-actions__title">Quick actions</h2>
      <div className="quick-actions-row">
        <button
          type="button"
          className="quick-actions-row__button"
          onClick={onAdd}
        >
          <span className="quick-actions-row__icon quick-actions-row__icon--add">
            <Plus size={30} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span>Add Expense</span>
        </button>
        <button
          type="button"
          className="quick-actions-row__button"
          onClick={onUpdateBudget}
        >
          <span className="quick-actions-row__icon quick-actions-row__icon--budget">
            <PencilLine size={27} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span>Update Budget</span>
        </button>
        <button
          type="button"
          className="quick-actions-row__button"
          onClick={onUpdateCategories}
        >
          <span className="quick-actions-row__icon quick-actions-row__icon--categories">
            <Tag size={27} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span>Categories</span>
        </button>
      </div>
    </section>
  )
}
