import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import './Sheet.css'

export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__handle" />
        {title ? (
          <div className="sheet__header">
            <h2 className="sheet__title">{title}</h2>
            <button
              type="button"
              className="sheet__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ) : null}
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
