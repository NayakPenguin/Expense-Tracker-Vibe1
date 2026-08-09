import { formatCurrency } from '../../utils/format'
import './CategoryLegendList.css'

export default function CategoryLegendList({ data, selectedId, onSelect }) {
  if (data.length === 0) {
    return (
      <div className="category-legend__empty">
        No transactions in this range yet.
      </div>
    )
  }

  return (
    <div className="category-legend">
      {data.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={
            'category-legend__row' +
            (selectedId === entry.id ? ' category-legend__row--active' : '')
          }
          onClick={() => onSelect(entry.id === selectedId ? null : entry.id)}
        >
          <span
            className="category-legend__swatch"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          <span className="category-legend__name">{entry.name}</span>
          <span className="category-legend__amount tabular-nums">
            {formatCurrency(entry.amount)}
          </span>
          <span className="category-legend__percent tabular-nums">
            {entry.percent}%
          </span>
        </button>
      ))}
    </div>
  )
}
