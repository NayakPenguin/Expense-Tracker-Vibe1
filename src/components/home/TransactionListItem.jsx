import ListRow from '../shared/ListRow'
import { getCategoryIcon } from '../../utils/categoryIcons'
import { formatCurrency, formatDateLabel } from '../../utils/format'
import './TransactionListItem.css'

export default function TransactionListItem({ transaction, category, onSelect }) {
  const isCredit = transaction.direction === 'credit'
  const CategoryIcon = getCategoryIcon(transaction.categoryId)

  return (
    <ListRow
      onClick={onSelect ? () => onSelect(transaction) : undefined}
      leading={
        <span
          className="transaction-item__category-icon"
          style={{ '--category-color': category?.color || 'var(--category-8)' }}
        >
          <CategoryIcon size={25} strokeWidth={1.8} aria-hidden="true" />
        </span>
      }
      title={<span className="transaction-item__merchant">{transaction.merchant}</span>}
      subtitle={transaction.note || formatDateLabel(transaction.date)}
      trailing={
        <span className="transaction-item__amount tabular-nums">
          {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>
      }
    />
  )
}
