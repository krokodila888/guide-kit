import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { autoUpdatePosition } from '../../core/positioning'
import type { HintProps } from './Hint.types'
import type { Placement } from '../../core/positioning'

const defaultStyles = {
  marker: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'var(--gk-primary, #2563eb)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flexShrink: 0,
    lineHeight: 1,
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  popover: {
    position: 'fixed' as const,
    background: 'var(--gk-bg, #ffffff)',
    color: 'var(--gk-text, #1f2937)',
    border: '1px solid var(--gk-border, #e5e7eb)',
    borderRadius: 'var(--gk-radius, 8px)',
    boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
    padding: '12px 16px',
    maxWidth: '280px',
    zIndex: 9999,
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: 'var(--gk-font, inherit)',
  } as React.CSSProperties,
}

export function Hint({ content, trigger = 'hover', placement = 'right', children }: HintProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const wrapperRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (isOpen && wrapperRef.current && popoverRef.current) {
      const cleanup = autoUpdatePosition(
        wrapperRef.current,
        popoverRef.current,
        placement as Placement,
        ({ x, y }) => setPosition({ x, y })
      )
      cleanupRef.current = cleanup
      return cleanup
    }
    return () => {
      cleanupRef.current?.()
    }
  }, [isOpen, placement])

  const handlers =
    trigger === 'hover'
      ? { onMouseEnter: open, onMouseLeave: close }
      : { onClick: (e: React.MouseEvent) => { e.stopPropagation(); setIsOpen(v => !v) } }

  const renderContent = () => {
    if (typeof content === 'string') {
      return <div>{content}</div>
    }
    return (
      <div>
        {content.title && (
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>{content.title}</div>
        )}
        <div>{content.description}</div>
        {(content.range || content.unit) && (
          <div style={{ marginTop: '6px', color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' }}>
            Диапазон: {content.range}{content.unit ? ` ${content.unit}` : ''}
          </div>
        )}
        {content.norm && (
          <div style={{ marginTop: '4px', color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' }}>
            Норматив: {content.norm}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <span
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        {children}
        <button
          ref={wrapperRef}
          type="button"
          style={defaultStyles.marker}
          aria-label="Подсказка"
          {...handlers}
        >
          ?
        </button>
      </span>
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{
            ...defaultStyles.popover,
            left: position.x,
            top: position.y,
          }}
          role="tooltip"
        >
          {renderContent()}
        </div>,
        document.body
      )}
    </>
  )
}
