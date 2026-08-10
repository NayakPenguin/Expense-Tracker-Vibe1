import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as db from '../lib/db'
import { useAuth } from './AuthContext'

const AppDataContext = createContext(null)

export const FALLBACK_CATEGORY_ID = db.FALLBACK_CATEGORY_ID

export function AppDataProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [settings, setSettings] = useState(null)
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataError, setDataError] = useState(null)

  // All three listeners must report once before the app has a complete picture;
  // rendering earlier would flash an empty state over data that is about to
  // arrive.
  const loadedRef = useRef({ settings: false, categories: false, transactions: false })

  useEffect(() => {
    if (!uid) {
      setSettings(null)
      setCategories([])
      setTransactions([])
      setIsDataLoading(false)
      setDataError(null)
      return undefined
    }

    let cancelled = false
    let unsubscribe = null

    loadedRef.current = { settings: false, categories: false, transactions: false }
    setIsDataLoading(true)
    setDataError(null)

    const markLoaded = (key) => {
      loadedRef.current[key] = true
      const { settings: s, categories: c, transactions: t } = loadedRef.current
      if (s && c && t) setIsDataLoading(false)
    }

    db.ensureUserDocument(uid, { displayName: user.displayName, email: user.email })
      .then(() => {
        if (cancelled) return
        unsubscribe = db.subscribeToUserData(uid, {
          onSettings: (data) => {
            setSettings(data)
            markLoaded('settings')
          },
          onCategories: (rows) => {
            setCategories(rows)
            markLoaded('categories')
          },
          onTransactions: (rows) => {
            setTransactions(rows)
            markLoaded('transactions')
          },
          onError: (error) => {
            if (cancelled) return
            setDataError(error)
            setIsDataLoading(false)
          },
        })
      })
      .catch((error) => {
        if (cancelled) return
        setDataError(error)
        setIsDataLoading(false)
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
    // user.displayName/email only seed the document on first run, so uid alone
    // is the correct trigger — re-subscribing on a profile edit would be waste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const value = useMemo(() => {
    const budget = {
      monthlyBudget: settings?.monthlyBudget ?? db.DEFAULT_BUDGET.monthlyBudget,
    }

    // Counted from the live local copy rather than a Firestore query — the
    // transactions are already in memory, so this costs nothing and stays
    // synchronous for the delete-confirmation copy.
    const countTransactionsInCategory = (id) =>
      transactions.filter((tx) => tx.categoryId === id).length

    return {
      categories,
      transactions,
      budget,
      hasCompletedSetup: settings?.hasCompletedSetup === true,
      isDataLoading,
      dataError,
      countTransactionsInCategory,
      addTransaction: (tx) => db.addTransaction(uid, tx),
      updateTransaction: (id, updates) => db.updateTransaction(uid, id, updates),
      deleteTransaction: (id) => db.deleteTransaction(uid, id),
      addCategory: (category) => db.addCategory(uid, category),
      updateCategory: (id, updates) => db.updateCategory(uid, id, updates),
      deleteCategory: (id) => db.deleteCategory(uid, id),
      updateBudget: (monthlyBudget) => db.updateBudget(uid, monthlyBudget),
      fetchTransactionsInRange: (start, end) => db.fetchTransactionsInRange(uid, start, end),
      completeSetup: (payload) => db.completeSetup(uid, payload),
    }
  }, [uid, settings, categories, transactions, isDataLoading, dataError])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
