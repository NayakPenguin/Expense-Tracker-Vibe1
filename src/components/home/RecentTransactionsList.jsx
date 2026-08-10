import GroupedList from '../shared/GroupedList'
import TransactionListItem from './TransactionListItem'
import './RecentTransactionsList.css'

export default function RecentTransactionsList({ transactions, categories, onSelect }) {
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

  return (
    <section className="recent-transactions">
      <h2 className="recent-transactions__title">Recent transactions</h2>
      {transactions.length === 0 ? (
        <div className="recent-transactions__empty">
          No expenses yet. Tap + to add your first one.
        </div>
      ) : (
        <GroupedList>
          {transactions.map((tx) => (
            <TransactionListItem
              key={tx.id}
              transaction={tx}
              category={categoryById[tx.categoryId]}
              onSelect={onSelect}
            />
          ))}
        </GroupedList>
      )}
    </section>
  )
}
