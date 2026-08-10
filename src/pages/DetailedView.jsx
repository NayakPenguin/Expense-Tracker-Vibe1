import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import DateRangeSelector from '../components/detailed/DateRangeSelector'
import CategoryDonutChart from '../components/detailed/CategoryDonutChart'
import CategoryLegendList from '../components/detailed/CategoryLegendList'
import { useAppData } from '../context/AppDataContext'
import { getRangeBounds, isWithinRange } from '../utils/dateRanges'
import { todayISO } from '../utils/dates'
import './DetailedView.css'

export default function DetailedView() {
  const navigate = useNavigate()
  const { categories, fetchTransactionsInRange } = useAppData()

  const [selectedPreset, setSelectedPreset] = useState('thisMonth')
  const [customStart, setCustomStart] = useState(todayISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [highlightedCategoryId, setHighlightedCategoryId] = useState(null)
  const [rangeTransactions, setRangeTransactions] = useState([])
  const [isRangeLoading, setIsRangeLoading] = useState(true)

  const bounds = useMemo(() => {
    if (selectedPreset === 'custom') {
      return { start: customStart, end: customEnd }
    }
    return getRangeBounds(selectedPreset)
  }, [selectedPreset, customStart, customEnd])

  // The shared subscription is capped at the most recent transactions, so a
  // wide range has to be fetched on its own rather than filtered from context.
  useEffect(() => {
    let cancelled = false
    setIsRangeLoading(true)

    fetchTransactionsInRange(bounds.start, bounds.end)
      .then((rows) => {
        if (!cancelled) {
          setRangeTransactions(rows)
          setIsRangeLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRangeTransactions([])
          setIsRangeLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds.start, bounds.end])

  const { legendData, total } = useMemo(() => {
    const inRange = rangeTransactions.filter(
      (tx) => tx.direction === 'debit' && isWithinRange(tx.date, bounds.start, bounds.end)
    )
    const totalAmount = inRange.reduce((sum, tx) => sum + tx.amount, 0)

    const byCategory = new Map()
    inRange.forEach((tx) => {
      byCategory.set(tx.categoryId, (byCategory.get(tx.categoryId) || 0) + tx.amount)
    })

    const rows = categories
      .filter((cat) => byCategory.has(cat.id))
      .map((cat) => {
        const amount = byCategory.get(cat.id)
        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          amount,
          percent: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)

    return { legendData: rows, total: totalAmount }
  }, [rangeTransactions, categories, bounds])

  return (
    <div>
      <header className="detailed-header">
        <button
          type="button"
          className="detailed-header__back"
          onClick={() => navigate('/')}
          aria-label="Back to Home"
        >
          <ArrowLeft size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <h1 className="detailed-header__title">Detailed View</h1>
      </header>

      <DateRangeSelector
        selected={selectedPreset}
        onSelect={(preset) => {
          setSelectedPreset(preset)
          setHighlightedCategoryId(null)
        }}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <CategoryDonutChart
        data={isRangeLoading ? [] : legendData}
        total={isRangeLoading ? 0 : total}
        selectedId={highlightedCategoryId}
      />

      {isRangeLoading ? (
        <p className="detailed-loading" aria-live="polite">
          Loading this range…
        </p>
      ) : (
        <CategoryLegendList
          data={legendData}
          selectedId={highlightedCategoryId}
          onSelect={setHighlightedCategoryId}
        />
      )}
    </div>
  )
}
