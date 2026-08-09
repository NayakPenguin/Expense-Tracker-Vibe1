import { createContext, useContext, useState } from 'react'
import categoriesFixture from '../mock/categories.json'
import transactionsFixture from '../mock/transactions.json'
import budgetFixture from '../mock/budget.json'
import userFixture from '../mock/user.json'

const AppDataContext = createContext(null)

let nextTransactionId = transactionsFixture.length + 1
let nextCategoryId = 1

export function AppDataProvider({ children }) {
  const [categories, setCategories] = useState(categoriesFixture)
  const [transactions, setTransactions] = useState(transactionsFixture)
  const [budget, setBudget] = useState(budgetFixture)
  const [user, setUser] = useState(userFixture)

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: `t${nextTransactionId++}`,
      direction: 'debit',
      note: null,
      ...transaction,
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const addCategory = (category) => {
    const newCategory = {
      id: `custom-${nextCategoryId++}`,
      ...category,
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id, updates) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    )
  }

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const updateBudget = (monthlyBudget) => {
    setBudget((prev) => ({ ...prev, monthlyBudget }))
  }

  const toggleIncomeHidden = () => {
    setBudget((prev) => ({ ...prev, incomeHidden: !prev.incomeHidden }))
  }

  const updateUserName = (name) => {
    setUser((prev) => ({ ...prev, name }))
  }

  return (
    <AppDataContext.Provider
      value={{
        categories,
        transactions,
        budget,
        user,
        addTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudget,
        toggleIncomeHidden,
        updateUserName,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
