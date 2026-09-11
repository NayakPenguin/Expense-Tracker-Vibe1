import { Bell } from 'lucide-react'
import './HomeHeader.css'

export default function HomeHeader({ name }) {
  return (
    <header className="home-header">
      <div className="home-header__greeting-wrap">
        <h1 className="home-header__greeting">Hello, {name}</h1>
        <span className="home-header__wave" role="img" aria-label="waving hand">👋</span>
      </div>
      <button className="home-header__notifications" type="button" aria-label="Notifications">
        <Bell size={27} strokeWidth={2} aria-hidden="true" />
        <span className="home-header__notification-dot" aria-hidden="true" />
      </button>
    </header>
  )
}
