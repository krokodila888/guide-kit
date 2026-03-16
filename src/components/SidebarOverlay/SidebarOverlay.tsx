import React from 'react'
import { createPortal } from 'react-dom'
import { SidebarHeader, SidebarBody } from '../Sidebar/SidebarContent'
import type { SidebarOverlayProps } from './SidebarOverlay.types'

export function SidebarOverlay({
  sections,
  open,
  onClose,
  title,
  side = 'left',
  width = 320,
  showToggleButton = true,
  toggleButtonLabel = 'Учебные материалы',
  backdrop = false,
  zIndex = 9000,
  className,
  style,
}: SidebarOverlayProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width
  const translateHidden = side === 'left' ? '-100%' : '100%'

  const sidebar = (
    <>
      {backdrop && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: zIndex - 1,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}

      <div
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: widthValue,
          zIndex,
          background: 'var(--gk-bg, #ffffff)',
          boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : `translateX(${translateHidden})`,
          transition: 'transform 0.25s ease',
          fontFamily: 'var(--gk-font, inherit)',
          ...style,
        }}
        aria-hidden={!open}
      >
        <SidebarHeader title={title} onClose={onClose} />
        <SidebarBody sections={sections} />
      </div>

      {showToggleButton && !open && (
        <button
          type="button"
          onClick={onClose}
          aria-label={toggleButtonLabel}
          style={{
            position: 'fixed',
            top: '50%',
            [side === 'left' ? 'left' : 'right']: 0,
            transform: 'translateY(-50%)',
            zIndex: zIndex - 1,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            rotate: side === 'left' ? '180deg' : '0deg',
            background: 'var(--gk-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 8px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: side === 'left' ? '0 6px 6px 0' : '6px 0 0 6px',
            fontFamily: 'var(--gk-font, inherit)',
          }}
        >
          {toggleButtonLabel}
        </button>
      )}
    </>
  )

  return createPortal(sidebar, document.body)
}
