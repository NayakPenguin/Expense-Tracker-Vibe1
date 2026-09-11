import { NavLink } from 'react-router-dom'
import { House, ChartPie, User } from 'lucide-react'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/details', label: 'Reports', Icon: ChartPie, end: false },
  { to: '/profile', label: 'Profile', Icon: User, end: false },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            'bottom-nav__item' + (isActive ? ' bottom-nav__item--active' : '')
          }
        >
          <Icon size={24} strokeWidth={2} aria-hidden="true" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
