import './ThemeToggle.css'

export default function ThemeToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={'theme-toggle' + (checked ? ' theme-toggle--on' : '')}
      role="switch"
      aria-checked={checked}
      aria-label="Toggle dark mode"
      onClick={onChange}
    >
      <span className="theme-toggle__thumb" />
    </button>
  )
}
