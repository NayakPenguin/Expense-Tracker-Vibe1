import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Minus, Sparkles } from 'lucide-react'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency } from '../utils/format'
import { getPaceCoachInsights } from '../utils/paceCoach'
import { trackAnalyticsEvent } from '../lib/firebase'
import './Coach.css'

const STATUS_COPY = {
  'on-track': ['On track', 'Your current pace fits inside this month’s budget.'],
  'over-pace': ['Over pace', 'At this rate, your spending may finish above budget.'],
  close: ['Near the limit', 'Your remaining budget needs a little extra care.'],
  exceeded: ['Budget reached', 'Focus on essentials for the rest of the month.'],
  'no-budget': ['Set a target', 'Add a budget to unlock daily guidance.'],
}

export default function Coach() {
  const navigate = useNavigate()
  const { transactions, categories, budget } = useAppData()
  const trackedRef = useRef(false)
  const insights = useMemo(
    () => getPaceCoachInsights({
      transactions,
      categories,
      monthlyBudget: budget.monthlyBudget,
    }),
    [transactions, categories, budget.monthlyBudget]
  )

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackAnalyticsEvent('pace_coach_detail_viewed', { status: insights.status })
  }, [insights.status])

  const [statusTitle, statusBody] = STATUS_COPY[insights.status]
  const weeklyDirection = insights.weekChangePercent > 0
    ? 'up'
    : insights.weekChangePercent < 0
      ? 'down'
      : 'steady'
  const WeeklyIcon = weeklyDirection === 'up'
    ? ArrowUpRight
    : weeklyDirection === 'down'
      ? ArrowDownRight
      : Minus

  const takeAction = () => {
    trackAnalyticsEvent('pace_coach_action_clicked', { action: insights.suggestion.action })
    if (insights.suggestion.action === 'details') navigate('/details')
    else navigate('/', { state: { coachAction: insights.suggestion.action } })
  }

  return (
    <div className="coach-page">
      <header className="coach-header">
        <button type="button" className="coach-header__back" onClick={() => navigate('/')} aria-label="Back to Home">
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <div>
          <p className="coach-header__eyebrow"><Sparkles size={14} aria-hidden="true" /> Pace Coach</p>
          <h1 className="coach-header__title">Your spending pace</h1>
        </div>
      </header>

      <section className={`coach-hero coach-hero--${insights.status}`}>
        <span className="coach-hero__status">{statusTitle}</span>
        <p className="coach-hero__label">Safe to spend today</p>
        <p className="coach-hero__amount tabular-nums">{formatCurrency(insights.safeToSpendToday)}</p>
        <p className="coach-hero__body">{statusBody}</p>
        <div className="coach-hero__grid">
          <div><span>Remaining</span><strong>{formatCurrency(insights.remainingBudget)}</strong></div>
          <div><span>Projected</span><strong>{formatCurrency(insights.projectedSpend)}</strong></div>
          <div><span>Days left</span><strong>{insights.daysLeft}</strong></div>
        </div>
      </section>

      <section className="coach-section" aria-labelledby="weekly-heading">
        <div className="coach-section__heading-row">
          <div>
            <p className="coach-section__eyebrow">Last 7 days</p>
            <h2 id="weekly-heading">Weekly check-in</h2>
          </div>
          <span className={`coach-week-change coach-week-change--${weeklyDirection}`}>
            <WeeklyIcon size={15} aria-hidden="true" />
            {Math.abs(Math.round(insights.weekChangePercent))}%
          </span>
        </div>
        <div className="coach-weekly-amounts">
          <div><span>This week</span><strong>{formatCurrency(insights.spentThisWeek)}</strong></div>
          <div><span>Previous</span><strong>{formatCurrency(insights.spentPreviousWeek)}</strong></div>
        </div>
        <p className="coach-section__note">
          {insights.topCategory
            ? `${insights.topCategory.name} leads this week at ${formatCurrency(insights.topCategory.amount)}.`
            : 'Add a few expenses to reveal your weekly pattern.'}
        </p>
      </section>

      <section className="coach-section" aria-labelledby="checkpoint-heading">
        <p className="coach-section__eyebrow">Budget checkpoint</p>
        <h2 id="checkpoint-heading">
          {insights.milestone ? `${insights.milestone}% checkpoint reached` : 'Next checkpoint: 50%'}
        </h2>
        <div
          className="coach-progress"
          role="progressbar"
          aria-label="Monthly budget used"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.min(100, Math.round(insights.budgetPercent))}
        >
          <span style={{ width: `${Math.min(100, insights.budgetPercent)}%` }} />
        </div>
        <p className="coach-section__note">
          {formatCurrency(insights.spentThisMonth)} of {formatCurrency(budget.monthlyBudget)} used this month.
        </p>
      </section>

      <section className="coach-recommendation" aria-labelledby="recommendation-heading">
        <p className="coach-section__eyebrow">Recommended next step</p>
        <h2 id="recommendation-heading">{insights.suggestion.title}</h2>
        <p>{insights.suggestion.body}</p>
        <button type="button" onClick={takeAction}>
          Take action <ArrowRight size={16} aria-hidden="true" />
        </button>
      </section>
    </div>
  )
}
