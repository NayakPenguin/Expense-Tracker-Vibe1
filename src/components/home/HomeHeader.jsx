import { TrendingUp } from 'lucide-react'
import './HomeHeader.css'

export default function HomeHeader({ name }) {
  return (
    <header className="home-header">
      <span className="home-header__icon" aria-hidden="true">
        <TrendingUp size={20} strokeWidth={2.25} />
      </span>
      <h1 className="home-header__greeting">Hi {name}</h1>
    </header>
  )
}
