import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import ListRow from '../shared/ListRow'
import { getCategoryIcon } from '../../utils/categoryIcons'
import { formatCurrency } from '../../utils/format'
import './TransactionListItem.css'

export default function TransactionListItem({ transaction, category, onSelect }) {
  const isCredit = transaction.direction === 'credit'
  const CategoryIcon = getCategoryIcon(transaction.categoryId)

  return (
    <ListRow
      onClick={onSelect ? () => onSelect(transaction) : undefined}
      leading={<CategoryIcon size={20} strokeWidth={2} aria-hidden="true" />}
      title={<span className="transaction-item__merchant">{transaction.merchant}</span>}
      subtitle={transaction.note}
      trailing={
        <span className="transaction-item__amount tabular-nums">
          <span
            className={
              'transaction-item__arrow' +
              (isCredit ? ' transaction-item__arrow--credit' : '')
            }
            aria-hidden="true"
          >
            {isCredit ? (
              <ArrowDownLeft size={14} strokeWidth={2.5} />
            ) : (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            )}
          </span>
          {formatCurrency(transaction.amount)}
        </span>
      }
    />
  )
}
