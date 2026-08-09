import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/format'
import './CategoryDonutChart.css'

export default function CategoryDonutChart({ data, total, selectedId }) {
  const hasData = data.length > 0

  return (
    <div className="category-donut">
      <div className="category-donut__chart">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius="72%"
                outerRadius="100%"
                paddingAngle={data.length > 1 ? 2 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    opacity={!selectedId || selectedId === entry.id ? 1 : 0.28}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="category-donut__empty-ring" />
        )}
        <div className="category-donut__center">
          <span className="category-donut__center-label">Total</span>
          <span className="category-donut__center-amount tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
