import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

const CONFIG_ERROR =
  'Firebase is not configured yet. Add the required values to .env.local and restart the app.'

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/network-request-failed':
      return 'Check your internet connection, then try signing in again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project.'
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not set up for this project. Open Authentication in Firebase Console, click Get started, and enable Google.'
    case 'auth/redirect-cancelled-by-user':
      return 'Google sign-in was cancelled. You can try again when you’re ready.'
    default:
      return 'We couldn’t sign you in with Google. Please try again.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setAuthError(CONFIG_ERROR)
      setIsAuthLoading(false)
      return undefined
    }

    let mounted = true
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (!mounted) return
        setUser(nextUser)
        setIsAuthLoading(false)
        setIsSigningIn(false)
      },
      (error) => {
        if (!mounted) return
        setAuthError(getAuthErrorMessage(error))
        setIsAuthLoading(false)
        setIsSigningIn(false)
      }
    )

    getRedirectResult(auth).catch((error) => {
      if (!mounted) return
      setAuthError(getAuthErrorMessage(error))
      setIsAuthLoading(false)
      setIsSigningIn(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      setAuthError(CONFIG_ERROR)
      return
    }

    setAuthError(null)
    setIsSigningIn(true)

    try {
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithRedirect(auth, provider)
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
      setIsSigningIn(false)
    }
  }

  const signOut = async () => {
    if (!auth) {
      setAuthError(CONFIG_ERROR)
      return
    }

    setAuthError(null)
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
      throw error
    }
  }

  const value = useMemo(
    () => ({ user, isAuthLoading, isSigningIn, authError, signInWithGoogle, signOut }),
    [user, isAuthLoading, isSigningIn, authError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export { CONFIG_ERROR, getAuthErrorMessage }
