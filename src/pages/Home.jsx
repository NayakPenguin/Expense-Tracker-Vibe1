import { useMemo, useState } from 'react'
import HomeHeader from '../components/home/HomeHeader'
import SpendingRingCard from '../components/home/SpendingRingCard'
import QuickActionsRow from '../components/home/QuickActionsRow'
import AddExpenseSheet from '../components/home/AddExpenseSheet'
import RecentTransactionsList from '../components/home/RecentTransactionsList'
import CategoryManagerSheet from '../components/profile/CategoryManagerSheet'
import BudgetEditorSheet from '../components/profile/BudgetEditorSheet'
import { useAppData } from '../context/AppDataContext'
import { getMonthLabel } from '../utils/format'

export default function Home() {
  const { user, transactions, categories, budget } = useAppData()

  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false)

  const now = new Date()

  const { spentThisMonth, sortedTransactions } = useMemo(() => {
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const spent = transactions
      .filter((tx) => {
        if (tx.direction !== 'debit') return false
        const txDate = new Date(tx.date + 'T00:00:00')
        return (
          txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth
        )
      })
      .reduce((sum, tx) => sum + tx.amount, 0)

    const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1))

    return { spentThisMonth: spent, sortedTransactions: sorted }
  }, [transactions])

  const percent = budget.monthlyBudget > 0 ? (spentThisMonth / budget.monthlyBudget) * 100 : 0

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1)
  const pacePercent = (now.getDate() / daysInMonth) * 100

  return (
    <div>
      <HomeHeader name={user.name} />

      <SpendingRingCard
        month={getMonthLabel(now)}
        spent={spentThisMonth}
        percent={percent}
        pacePercent={pacePercent}
        monthlyBudget={budget.monthlyBudget}
        daysLeft={daysLeft}
        onOpenBudget={() => setBudgetEditorOpen(true)}
      />

      <QuickActionsRow
        onAdd={() => setAddExpenseOpen(true)}
        onUpdateBudget={() => setBudgetEditorOpen(true)}
        onUpdateCategories={() => setCategoryManagerOpen(true)}
      />

      <RecentTransactionsList
        transactions={sortedTransactions.slice(0, 8)}
        categories={categories}
      />

      <AddExpenseSheet open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} />
      <CategoryManagerSheet
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
      <BudgetEditorSheet open={budgetEditorOpen} onClose={() => setBudgetEditorOpen(false)} />
    </div>
  )
}
