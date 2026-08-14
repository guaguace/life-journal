import React, { useEffect } from 'react'
import { IconClose } from '../Icons'

export default function BottomSheet({ isOpen, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="bottom-sheet-handle" />

        {/* Header */}
        <div className="bottom-sheet-header">
          <div>
            <h3 className="bottom-sheet-title">{title}</h3>
            {subtitle && <p className="bottom-sheet-subtitle">{subtitle}</p>}
          </div>
          <button className="bottom-sheet-close" onClick={onClose}>
            <IconClose color="#9C856B" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  )
}
