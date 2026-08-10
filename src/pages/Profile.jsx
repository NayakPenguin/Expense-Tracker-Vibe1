import { useMemo, useState } from 'react'
import ProfileHeader from '../components/profile/ProfileHeader'
import SettingsList from '../components/profile/SettingsList'
import CategoryManagerSheet from '../components/profile/CategoryManagerSheet'
import BudgetEditorSheet from '../components/profile/BudgetEditorSheet'
import { useAppData } from '../context/AppDataContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { categories, transactions, budget } = useAppData()
  const { theme, toggleTheme } = useTheme()
  const { authError, signOut } = useAuth()

  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [budgetEditorOpen, setBudgetEditorOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch {
      // AuthContext exposes the user-facing error next to the action.
    } finally {
      setIsSigningOut(false)
    }
  }

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

      {authError ? <p className="profile-page__auth-error" role="alert">{authError}</p> : null}
      <button
        type="button"
        className="profile-page__sign-out"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </button>

      <CategoryManagerSheet
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
      />
      <BudgetEditorSheet open={budgetEditorOpen} onClose={() => setBudgetEditorOpen(false)} />
    </div>
  )
}
