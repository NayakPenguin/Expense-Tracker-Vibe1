import { useState } from 'react'
import GroupedList from '../shared/GroupedList'
import TransactionListItem from './TransactionListItem'
import './RecentTransactionsList.css'

export default function RecentTransactionsList({ transactions, categories, onSelect, onViewAll }) {
  const [showAll, setShowAll] = useState(false)
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 3)

  return (
    <section className="recent-transactions">
      <div className="recent-transactions__heading">
        <h2 className="recent-transactions__title">Recent transactions</h2>
        {onViewAll ? (
          <button type="button" className="recent-transactions__view-all" onClick={onViewAll}>
            View all
          </button>
        ) : null}
      </div>
      {transactions.length === 0 ? (
        <div className="recent-transactions__empty">
          No expenses yet. Tap + to add your first one.
        </div>
      ) : (
        <GroupedList>
          {visibleTransactions.map((tx) => (
            <TransactionListItem
              key={tx.id}
              transaction={tx}
              category={categoryById[tx.categoryId]}
              onSelect={onSelect}
            />
          ))}
        </GroupedList>
      )}
      {transactions.length > 3 ? (
        <button
          type="button"
          className="recent-transactions__show-more"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      ) : null}
    </section>
  )
}
