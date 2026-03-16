import React from 'react'
import { SidebarHeader, SidebarBody } from '../Sidebar/SidebarContent'
import type { SidebarPushProps } from './SidebarPush.types'

/**
 * SidebarPush — сайдбар, сдвигающий основной контент.
 *
 * Не использует portal. Должен быть помещён внутрь flex-контейнера:
 *
 * ```tsx
 * <div data-gk-container style={{ display: 'flex', height: '100vh' }}>
 *   <SidebarPush open={open} onClose={() => setOpen(false)} sections={[...]} />
 *   <main style={{ flex: 1, overflow: 'auto' }}>...</main>
 * </div>
 * ```
 *
 * Встроенная кнопка-триггер не предусмотрена — управляйте `open` снаружи.
 */
export function SidebarPush({
  sections,
  open,
  onClose,
  title,
  side = 'left',
  width = 320,
  animated = true,
  className,
  style,
}: SidebarPushProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: open ? widthValue : 0,
        flexShrink: 0,
        overflow: 'hidden',
        height: '100%',
        transition: animated ? 'width 0.25s ease' : undefined,
        order: side === 'right' ? 1 : undefined,
        ...style,
      }}
    >
      {/* Inner content div has fixed width so content doesn't squish during animation */}
      <div
        style={{
          width: widthValue,
          height: '100%',
          background: 'var(--gk-bg, #ffffff)',
          borderRight: side === 'left' ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
          borderLeft: side === 'right' ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--gk-font, inherit)',
        }}
      >
        <SidebarHeader title={title} onClose={onClose} />
        <SidebarBody sections={sections} />
      </div>
    </div>
  )
}
