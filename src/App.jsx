import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppDataProvider } from './context/AppDataContext'
import BottomNav from './components/shared/BottomNav'
import Home from './pages/Home'
import DetailedView from './pages/DetailedView'
import Profile from './pages/Profile'

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <HashRouter>
          <div className="app-shell">
            <div className="app-shell__content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/details" element={<DetailedView />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
            <BottomNav />
          </div>
        </HashRouter>
      </AppDataProvider>
    </ThemeProvider>
  )
}
