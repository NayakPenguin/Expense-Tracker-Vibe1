import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/shared/BottomNav'
import AuthLoadingScreen from './components/auth/AuthLoadingScreen'

const Home = lazy(() => import('./pages/Home'))
const DetailedView = lazy(() => import('./pages/DetailedView'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))

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

  if (isAuthLoading) return <AuthLoadingScreen />

  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <Routes>
        <Route path="/onboarding" element={user ? <Navigate to="/" replace /> : <Onboarding />} />
        <Route element={user ? <AuthenticatedLayout /> : <Navigate to="/onboarding" replace />}>
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
    <ThemeProvider>
      <AuthProvider>
        <AppDataProvider>
          <HashRouter><AppRoutes /></HashRouter>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
