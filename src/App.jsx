import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider, useAppData } from './context/AppDataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/shared/BottomNav'
import ErrorBoundary from './components/shared/ErrorBoundary'
import AuthLoadingScreen from './components/auth/AuthLoadingScreen'
import DataErrorScreen from './components/auth/DataErrorScreen'

const Home = lazy(() => import('./pages/Home'))
const DetailedView = lazy(() => import('./pages/DetailedView'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Setup = lazy(() => import('./pages/Setup'))

function AuthenticatedLayout() {
  return (
    <div className="app-shell">
      <div className="app-shell__content"><Outlet /></div>
      <BottomNav />
    </div>
  )
}

export function AppRoutes() {
  const { user, isAuthLoading } = useAuth()
  const { isDataLoading, hasCompletedSetup, dataError } = useAppData()

  if (isAuthLoading) return <AuthLoadingScreen />
  // A signed-in user has no usable screen until Firestore reports back, and
  // rendering early would flash an empty ring over data that is on its way.
  if (user && isDataLoading) return <AuthLoadingScreen />
  if (user && dataError) return <DataErrorScreen error={dataError} />

  const needsSetup = Boolean(user) && !hasCompletedSetup

  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <Routes>
        <Route path="/onboarding" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
        <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
        <Route
          path="/setup"
          element={
            !user ? (
              <Navigate to="/onboarding" replace />
            ) : hasCompletedSetup ? (
              <Navigate to="/" replace />
            ) : (
              <Setup />
            )
          }
        />
        <Route
          element={
            !user ? (
              <Navigate to="/onboarding" replace />
            ) : needsSetup ? (
              <Navigate to="/setup" replace />
            ) : (
              <AuthenticatedLayout />
            )
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<DetailedView />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/' : '/onboarding'} replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    // Outermost so it also catches failures inside the providers themselves,
    // not just inside the routed screens.
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <HashRouter><AppRoutes /></HashRouter>
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
