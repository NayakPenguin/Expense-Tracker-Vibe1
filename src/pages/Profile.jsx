import { useMemo, useState } from 'react'
import ProfileHeader from '../components/profile/ProfileHeader'
import SettingsList from '../components/profile/SettingsList'
import CategoryManagerSheet from '../components/profile/CategoryManagerSheet'
import BudgetEditorSheet from '../components/profile/BudgetEditorSheet'
import { useAppData } from '../context/AppDataContext'
import { useTheme } from '../context/ThemeContext'
import './Profile.css'

export default function Profile() {
  const { categories, transactions, budget } = useAppData()
  const { theme, toggleTheme } = useTheme()

  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false)

  const budgetPercent = useMemo(() => {
    const now = new Date()
    const spent = transactions
      .filter((tx) => {
        if (tx.direction !== 'debit') return false
        const txDate = new Date(tx.date + 'T00:00:00')
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        )
      })
      .reduce((sum, tx) => sum + tx.amount, 0)
    return budget.monthlyBudget > 0 ? (spent / budget.monthlyBudget) * 100 : 0
  }, [transactions, budget.monthlyBudget])

  return (
    <div className="profile-page">
      <ProfileHeader />

      <SettingsList
        categoryCount={categories.length}
        monthlyBudget={budget.monthlyBudget}
        budgetPercent={budgetPercent}
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
        onOpenCategories={() => setCategoryManagerOpen(true)}
        onOpenBudget={() => setBudgetEditorOpen(true)}
      />

      <CategoryManagerSheet
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
      <BudgetEditorSheet open={budgetEditorOpen} onClose={() => setBudgetEditorOpen(false)} />
    </div>
  )
}
