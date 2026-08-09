import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import DateRangeSelector from '../components/detailed/DateRangeSelector'
import CategoryDonutChart from '../components/detailed/CategoryDonutChart'
import CategoryLegendList from '../components/detailed/CategoryLegendList'
import { useAppData } from '../context/AppDataContext'
import { getRangeBounds, isWithinRange } from '../utils/dateRanges'
import './DetailedView.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function DetailedView() {
  const navigate = useNavigate()
  const { transactions, categories } = useAppData()

  const [selectedPreset, setSelectedPreset] = useState('thisMonth')
  const [customStart, setCustomStart] = useState(todayISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [highlightedCategoryId, setHighlightedCategoryId] = useState(null)

  const bounds = useMemo(() => {
    if (selectedPreset === 'custom') {
      return { start: customStart, end: customEnd }
    }
    return getRangeBounds(selectedPreset)
  }, [selectedPreset, customStart, customEnd])

  const { legendData, total } = useMemo(() => {
    const inRange = transactions.filter(
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
  }, [transactions, categories, bounds])

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
        data={legendData}
        total={total}
        selectedId={highlightedCategoryId}
      />

      <CategoryLegendList
        data={legendData}
        selectedId={highlightedCategoryId}
        onSelect={setHighlightedCategoryId}
      />
    </div>
  )
}
