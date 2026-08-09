import Ring from '../shared/Ring'
import { formatCurrency } from '../../utils/format'
import './SpendingRingCard.css'

export default function SpendingRingCard({
  month,
  spent,
  percent,
  pacePercent,
  monthlyBudget,
  daysLeft,
  onOpenBudget,
}) {
  const onTrack = percent <= pacePercent

  return (
    <section className="spending-ring-card">
      <div className="spending-ring-card__ring-wrap">
        <Ring percent={percent} pacePercent={pacePercent} size={172} strokeWidth={13}>
          <span className="spending-ring-card__ring-label">
            Spent in {month}
          </span>
          <span className="spending-ring-card__ring-amount tabular-nums">
            {formatCurrency(spent)}
          </span>
          <span className="spending-ring-card__ring-percent tabular-nums">
            {Math.round(percent)}%
          </span>
        </Ring>
      </div>

      <div className="spending-ring-card__stats">
        <button
          type="button"
          className="spending-ring-card__stat"
          onClick={onOpenBudget}
        >
          <span className="spending-ring-card__stat-label">Budget</span>
          <span className="spending-ring-card__stat-value tabular-nums">
            {formatCurrency(monthlyBudget)}
          </span>
          <span
            className={
              'spending-ring-card__pace-pill' +
              (onTrack ? ' spending-ring-card__pace-pill--good' : ' spending-ring-card__pace-pill--over')
            }
          >
            {onTrack ? 'On track' : 'Over pace'}
          </span>
        </button>

        <div className="spending-ring-card__divider" />

        <span className="spending-ring-card__stat">
          <span className="spending-ring-card__stat-label">Days left</span>
          <span className="spending-ring-card__stat-value spending-ring-card__stat-value--coral tabular-nums">
            {daysLeft}
          </span>
        </span>
      </div>
    </section>
  )
}
