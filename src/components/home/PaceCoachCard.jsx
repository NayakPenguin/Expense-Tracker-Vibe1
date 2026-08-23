import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { trackAnalyticsEvent } from '../../lib/firebase'
import './PaceCoachCard.css'

const STATUS_LABELS = {
  'on-track': 'On track',
  'over-pace': 'Over pace',
  close: 'Near limit',
  exceeded: 'Budget reached',
  'no-budget': 'Needs a target',
}

export default function PaceCoachCard({ insights, onOpen }) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackAnalyticsEvent('pace_coach_card_viewed', { status: insights.status })
  }, [insights.status])

  const handleOpen = () => {
    trackAnalyticsEvent('pace_coach_opened', { source: 'home', status: insights.status })
    onOpen()
  }

  return (
    <section className={`pace-coach-card pace-coach-card--${insights.status}`}>
      <div className="pace-coach-card__eyebrow">
        <span className="pace-coach-card__icon" aria-hidden="true">
          <Sparkles size={16} strokeWidth={2.2} />
        </span>
        <span>Pace Coach</span>
        <span className="pace-coach-card__status">{STATUS_LABELS[insights.status]}</span>
      </div>

      <div className="pace-coach-card__content">
        <div>
          <p className="pace-coach-card__label">Safe to spend today</p>
          <p className="pace-coach-card__amount tabular-nums">
            {formatCurrency(insights.safeToSpendToday)}
          </p>
        </div>
        <div className="pace-coach-card__projection">
          <span>Projected month</span>
          <strong className="tabular-nums">{formatCurrency(insights.projectedSpend)}</strong>
        </div>
      </div>

      <p className="pace-coach-card__message">{insights.suggestion.body}</p>

      <button type="button" className="pace-coach-card__action" onClick={handleOpen}>
        View weekly insights
        <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </section>
  )
}
