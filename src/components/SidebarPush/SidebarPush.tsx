import React from 'react'
import { SidebarHeader, SidebarBody } from '../Sidebar/SidebarContent'
import type { SidebarPushProps } from './SidebarPush.types'

/** Width of the collapsed tab strip in px */
const TAB_WIDTH = 32

/**
 * SidebarPush — сайдбар, сдвигающий основной контент.
 *
 * Не использует portal. Должен быть помещён внутрь flex-контейнера
 * с `overflow: hidden`:
 *
 * ```tsx
 * <div data-gk-container style={{ display: 'flex', overflow: 'hidden', height: '100vh' }}>
 *   <SidebarPush open={open} onClose={() => setOpen(false)} onOpen={() => setOpen(true)}
 *                showToggleButton sections={[...]} />
 *   <main style={{ flex: 1, overflow: 'auto' }}>...</main>
 * </div>
 * ```
 *
 * Когда `showToggleButton` задан, при закрытии остаётся узкий язычок-кнопка
 * у края контента. Родительский контейнер должен иметь `overflow: hidden`,
 * чтобы скрыть ушедшую за экран панель.
 */
export function SidebarPush({
  sections,
  open,
  onClose,
  onOpen,
  title,
  side = 'left',
  width = 320,
  showToggleButton = false,
  toggleButtonLabel = 'Открыть',
  animated = true,
  className,
  style,
}: SidebarPushProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width

  // When closed: keep TAB_WIDTH so the toggle tab stays in the flex layout;
  // when no toggle, collapse to 0 (original behaviour).
  const outerWidth = open ? widthValue : (showToggleButton ? `${TAB_WIDTH}px` : '0')

  // Inner panel slides off-screen via transform; the parent overflow:hidden clips it.
  const panelTranslate = open
    ? 'translateX(0)'
    : `translateX(${side === 'left' ? `-${widthValue}` : widthValue})`

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        flexShrink: 0,
        // overflow:visible lets the toggle tab render while the inner panel is hidden
        // by the parent container's overflow:hidden
        overflow: 'visible',
        height: '100%',
        width: outerWidth,
        transition: animated ? 'width 0.25s ease' : undefined,
        order: side === 'right' ? 1 : undefined,
        ...style,
      }}
    >
      {/* ── Sidebar panel ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          // Anchor to the edge that faces the content so it slides toward the wall
          [side === 'left' ? 'left' : 'right']: 0,
          width: widthValue,
          height: '100%',
          background: 'var(--gk-bg, #ffffff)',
          borderRight: side === 'left' ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
          borderLeft: side === 'right' ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--gk-font, inherit)',
          transform: panelTranslate,
          transition: animated ? 'transform 0.25s ease' : undefined,
        }}
      >
        <SidebarHeader title={title} onClose={onClose} />
        <SidebarBody sections={sections} />
      </div>

      {/* ── Toggle tab — visible only when collapsed ── */}
      {showToggleButton && !open && (
        <button
          type="button"
          onClick={() => onOpen?.()}
          aria-label={toggleButtonLabel}
          style={{
            position: 'absolute',
            top: '50%',
            // Anchor to the wall side so the tab touches the container edge
            [side === 'left' ? 'left' : 'right']: 0,
            transform: 'translateY(-50%)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            // 180deg makes text read bottom-to-top (conventional for left-side tabs)
            rotate: side === 'left' ? '180deg' : '0deg',
            background: 'var(--gk-primary, #2563eb)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 6px',
            fontSize: '13px',
            fontWeight: 500,
            // LEFT side: left=flat(wall), right=rounded(content) — '6px 0 0 6px' pre-rotation gives this after 180deg
            // RIGHT side: left=rounded(content), right=flat(wall) — '6px 0 0 6px' without rotation gives this directly
            borderRadius: '6px 0 0 6px',
            fontFamily: 'var(--gk-font, inherit)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {toggleButtonLabel}
        </button>
      )}
    </div>
  )
}
