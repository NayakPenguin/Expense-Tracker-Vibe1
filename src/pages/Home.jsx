import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import HomeHeader from '../components/home/HomeHeader'
import SpendingRingCard from '../components/home/SpendingRingCard'
import QuickActionsRow from '../components/home/QuickActionsRow'
import AddExpenseSheet from '../components/home/AddExpenseSheet'
import RecentTransactionsList from '../components/home/RecentTransactionsList'
import CategoryManagerSheet from '../components/profile/CategoryManagerSheet'
import BudgetEditorSheet from '../components/profile/BudgetEditorSheet'
import PaceCoachCard from '../components/home/PaceCoachCard'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { getPaceCoachInsights } from '../utils/paceCoach'

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { transactions, categories, budget } = useAppData()
  const { user } = useAuth()

  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false)

  useEffect(() => {
    const action = location.state?.coachAction
    if (action === 'add') setAddExpenseOpen(true)
    if (action === 'budget') setBudgetEditorOpen(true)
    if (action) navigate('/', { replace: true, state: null })
  }, [location.state, navigate])

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

  const coachInsights = useMemo(
    () => getPaceCoachInsights({
      transactions,
      categories,
      monthlyBudget: budget.monthlyBudget,
      now,
    }),
    [transactions, categories, budget.monthlyBudget]
  )

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1)
  return (
    <div className="home-page">
      <HomeHeader name={user?.displayName?.trim().split(/\s+/)[0] || 'there'} />

      <SpendingRingCard
        spent={spentThisMonth}
        percent={percent}
        monthlyBudget={budget.monthlyBudget}
        daysLeft={daysLeft}
        onOpenBudget={() => setBudgetEditorOpen(true)}
      />

      <PaceCoachCard insights={coachInsights} onOpen={() => navigate('/coach')} />

      <QuickActionsRow
        onAdd={() => setAddExpenseOpen(true)}
        onUpdateBudget={() => setBudgetEditorOpen(true)}
        onUpdateCategories={() => setCategoryManagerOpen(true)}
      />

      <RecentTransactionsList
        transactions={sortedTransactions.slice(0, 8)}
        categories={categories}
        onSelect={setEditingTransaction}
        onViewAll={() => navigate('/details')}
      />

      {/* One sheet, two modes — a transaction present means edit. */}
      <AddExpenseSheet
        open={addExpenseOpen || Boolean(editingTransaction)}
        transaction={editingTransaction}
        onClose={() => {
          setAddExpenseOpen(false)
          setEditingTransaction(null)
        }}
      />
      <CategoryManagerSheet
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
      <BudgetEditorSheet open={budgetEditorOpen} onClose={() => setBudgetEditorOpen(false)} />
    </div>
  )
}
