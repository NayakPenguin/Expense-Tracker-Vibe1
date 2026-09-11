import Ring from '../shared/Ring'
import { CalendarDays, WalletCards } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import './SpendingRingCard.css'

export default function SpendingRingCard({
  spent,
  percent,
  monthlyBudget,
  daysLeft,
  onOpenBudget,
}) {
  const amountLeft = Math.max(0, monthlyBudget - spent)

  return (
    <section className="spending-ring-card">
      <div className="spending-ring-card__summary">
        <span className="spending-ring-card__eyebrow">Amount left to spend</span>
        <strong className="spending-ring-card__amount tabular-nums">
          {formatCurrency(amountLeft)}
        </strong>
        <span className="spending-ring-card__percent tabular-nums">{Math.round(percent)}% Used</span>
      </div>

      <div className="spending-ring-card__ring-wrap" aria-label={`${Math.round(percent)} percent of budget used`}>
        <Ring
          percent={percent}
          size={146}
          strokeWidth={12}
          trackColor="var(--ring-track)"
          fillColor="var(--color-violet)"
        >
          <span className="spending-ring-card__wallet-icon" aria-hidden="true">
            <WalletCards size={42} strokeWidth={1.9} />
          </span>
        </Ring>
      </div>

      <div className="spending-ring-card__stats">
        <button
          type="button"
          className="spending-ring-card__stat"
          onClick={onOpenBudget}
        >
          <span className="spending-ring-card__stat-icon spending-ring-card__stat-icon--budget" aria-hidden="true">
            <WalletCards size={27} strokeWidth={1.8} />
          </span>
          <span className="spending-ring-card__stat-copy">
            <span className="spending-ring-card__stat-label">Budget</span>
            <span className="spending-ring-card__stat-value tabular-nums">
              {formatCurrency(monthlyBudget)}
            </span>
          </span>
        </button>

        <span className="spending-ring-card__stat">
          <span className="spending-ring-card__stat-icon spending-ring-card__stat-icon--days" aria-hidden="true">
            <CalendarDays size={27} strokeWidth={1.8} />
          </span>
          <span className="spending-ring-card__stat-copy">
            <span className="spending-ring-card__stat-label">Days left</span>
            <span className="spending-ring-card__stat-value tabular-nums">{daysLeft}</span>
          </span>
        </span>
      </div>
    </section>
  )
}
