import './Chip.css'

export default function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={'chip' + (active ? ' chip--active' : '')}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
