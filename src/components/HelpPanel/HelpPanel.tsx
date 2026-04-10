import React, {
  useState, useEffect, useCallback, useContext, useRef, useId,
} from 'react'
import { createPortal } from 'react-dom'
import { HelpRegistry } from '../../core/registry'
import { HelpStorage } from '../../core/storage'
import { HelpPanelContext } from './HelpPanelContext'
import type { HelpItemRegistration } from '../../core/registry'
import type { HelpPanelProps, HelpPanelPosition } from './HelpPanel.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function TypeIcon({ type }: { type: HelpItemRegistration['type'] }) {
  switch (type) {
    case 'tour':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      )
    case 'hint':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
        </svg>
      )
    case 'sidebar':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      )
    case 'doc':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case 'video':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
  }
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={id}
      onClick={e => { e.stopPropagation(); onChange() }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'var(--gk-primary, #2563eb)' : '#d1d5db',
        border: 'none',
        cursor: 'pointer',
        padding: '2px',
        flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <span style={{
        display: 'block',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#fff',
        transform: checked ? 'translateX(16px)' : 'translateX(0)',
        transition: 'transform 0.2s ease',
      }} />
    </button>
  )
}

// ─── Position helpers ─────────────────────────────────────────────────────────

function buttonPosition(pos: HelpPanelPosition): React.CSSProperties {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 10001 }
  if (pos === 'bottom-right') return { ...base, bottom: 16, right: 16 }
  if (pos === 'bottom-left')  return { ...base, bottom: 16, left: 16 }
  if (pos === 'top-right')    return { ...base, top: 16, right: 16 }
  return { ...base, top: 16, left: 16 }
}

function panelPosition(pos: HelpPanelPosition): React.CSSProperties {
  const base: React.CSSProperties = { position: 'fixed', zIndex: 10000, width: '280px' }
  const gap = 56 + 8 // button height + gap
  if (pos === 'bottom-right') return { ...base, bottom: gap, right: 16 }
  if (pos === 'bottom-left')  return { ...base, bottom: gap, left: 16 }
  if (pos === 'top-right')    return { ...base, top: gap, right: 16 }
  return { ...base, top: gap, left: 16 }
}

// ─── HelpPanel ────────────────────────────────────────────────────────────────

export function HelpPanel({
  items: itemsProp,
  position = 'bottom-right',
  label = 'Help',
  storageKey = 'guide-kit-help',
  persistState = true,
  onOpen,
  onClose,
  onItemToggle,
  onItemActivate,
  className,
  style,
}: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Determine source of items and enabled state
  const ctx = useContext(HelpPanelContext)

  // Local state for standalone mode (no context, no itemsProp)
  const [registryItems, setRegistryItems] = useState<HelpItemRegistration[]>(
    () => HelpRegistry.getAll()
  )
  const [localEnabled, setLocalEnabled] = useState<Record<string, boolean>>(
    () => (persistState ? HelpStorage.getEnabled(storageKey) : {})
  )

  // Subscribe to registry when not using context or itemsProp.
  // Read current state immediately: children's effects (useHelpRegistry) run
  // before this effect, so items may already be registered by now.
  useEffect(() => {
    if (itemsProp || ctx) return
    setRegistryItems(HelpRegistry.getAll())
    const unsub = HelpRegistry.subscribe(() => setRegistryItems(HelpRegistry.getAll()))
    return unsub
  }, [itemsProp, ctx])

  const items: HelpItemRegistration[] = itemsProp ?? ctx?.items ?? registryItems

  const isEnabled = useCallback((id: string): boolean => {
    if (ctx) return ctx.isEnabled(id)
    if (id in localEnabled) return localEnabled[id]
    const item = items.find(i => i.id === id)
    return item?.defaultEnabled ?? true
  }, [ctx, localEnabled, items])

  const toggle = useCallback((id: string) => {
    if (ctx) {
      const next = !ctx.isEnabled(id)
      ctx.toggle(id)
      onItemToggle?.(id, next)
      return
    }
    setLocalEnabled(prev => {
      const current = isEnabled(id)
      const next = !current
      if (persistState) HelpStorage.setEnabled(id, next, storageKey)
      onItemToggle?.(id, next)
      return { ...prev, [id]: next }
    })
  }, [ctx, isEnabled, persistState, storageKey, onItemToggle])

  const handleReset = useCallback(() => {
    if (persistState) HelpStorage.reset(storageKey)
    if (ctx) {
      // Re-read defaults
      items.forEach(item => {
        const def = item.defaultEnabled ?? true
        if (!ctx.isEnabled(item.id) !== !def) ctx.toggle(item.id)
      })
    } else {
      setLocalEnabled({})
    }
  }, [ctx, items, persistState, storageKey])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const togglePanel = useCallback(() => {
    if (isOpen) handleClose(); else handleOpen()
  }, [isOpen, handleOpen, handleClose])

  // Close on outside click
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!isOpen) return
    function onPointerDown(e: PointerEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        handleClose()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen, handleClose])

  const enabledCount = items.filter(i => isEnabled(i.id)).length
  const labelId = useId()

  const panel = isOpen ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Help panel"
      style={{
        ...panelPosition(position),
        background: 'var(--gk-bg, #ffffff)',
        border: '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
        fontFamily: 'var(--gk-font, inherit)',
        fontSize: '14px',
        overflow: 'hidden',
        transformOrigin: position.includes('bottom') ? 'bottom center' : 'top center',
        animation: 'gk-panel-in 0.15s ease',
      }}
    >
      <style>{`@keyframes gk-panel-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--gk-border, #e5e7eb)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--gk-text, #1f2937)' }}>
          Available help
        </span>
        <span style={{ fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)' }}>
          {enabledCount} of {items.length} enabled
        </span>
      </div>

      {/* Items */}
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--gk-text-muted, #6b7280)', fontSize: '13px' }}>
            No help items available
          </div>
        ) : (
          items.map(item => {
            const enabled = isEnabled(item.id)
            const rowId = `${labelId}-${item.id}`
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!enabled) return
                  item.action?.()
                  onItemActivate?.(item.id)
                  handleClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  cursor: enabled ? 'pointer' : 'default',
                  opacity: enabled ? 1 : 0.45,
                  borderBottom: '1px solid var(--gk-border, #e5e7eb)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (enabled) (e.currentTarget as HTMLDivElement).style.background = 'var(--gk-border, #f3f4f6)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '' }}
              >
                {/* Type icon */}
                <span style={{ color: 'var(--gk-primary, #2563eb)', flexShrink: 0 }}>
                  <TypeIcon type={item.type} />
                </span>

                {/* Label + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div id={rowId} style={{ fontWeight: 500, fontSize: '13px', color: 'var(--gk-text, #1f2937)', lineHeight: '1.3' }}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', marginTop: '2px', lineHeight: '1.3' }}>
                      {item.description}
                    </div>
                  )}
                </div>

                {/* Toggle */}
                <Toggle checked={enabled} onChange={() => toggle(item.id)} id={rowId} />
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--gk-border, #e5e7eb)' }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'var(--gk-text-muted, #6b7280)',
            padding: 0,
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Reset settings
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={className}
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close help panel' : label}
        style={{
          ...buttonPosition(position),
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--gk-primary, #2563eb)',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: 'var(--gk-font, inherit)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          ...style,
        }}
      >
        {isOpen ? <CloseIcon /> : <HelpIcon />}
        {isOpen ? 'Close' : label}
      </button>
      {createPortal(panel, document.body)}
    </>
  )
}

// ─── useHelpRegistry ──────────────────────────────────────────────────────────

import type { HelpItemRegistration as HelpItem } from '../../core/registry'

export function useHelpRegistry(item: HelpItem): void {
  const stableAction = useRef(item.action)
  stableAction.current = item.action

  useEffect(() => {
    const registration: HelpItem = {
      ...item,
      action: () => stableAction.current?.(),
    }
    const unregister = HelpRegistry.register(registration)
    return unregister
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])
}
