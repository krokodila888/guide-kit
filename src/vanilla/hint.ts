import { autoUpdatePosition } from '../core/positioning'
import type { Placement } from '../core/positioning'
import { portal, escapeHtml } from './utils'
import type { VanillaHintOptions, HintInstance } from './index.types'

function buildPopoverHTML(content: VanillaHintOptions['content']): string {
  if (typeof content === 'string') {
    return `<div class="gk-hint-text" style="font-size:14px;line-height:1.5">${escapeHtml(content)}</div>`
  }
  let html = ''
  if (content.title) {
    html += `<div class="gk-hint-title" style="font-weight:600;margin-bottom:6px;font-size:14px">${escapeHtml(content.title)}</div>`
  }
  html += `<div class="gk-hint-desc" style="font-size:14px;line-height:1.5">${escapeHtml(content.description)}</div>`
  const hasMeta = content.range || content.unit || content.norm
  if (hasMeta) {
    html += `<div class="gk-hint-meta" style="margin-top:6px;display:flex;flex-direction:column;gap:2px">`
    if (content.range || content.unit) {
      const rangeText = [content.range, content.unit].filter(Boolean).join(' ')
      html += `<span style="color:var(--gk-text-muted,#6b7280);font-size:12px">Range: ${escapeHtml(rangeText)}</span>`
    }
    if (content.norm) {
      html += `<span style="color:var(--gk-text-muted,#6b7280);font-size:12px">Standard: ${escapeHtml(content.norm)}</span>`
    }
    html += `</div>`
  }
  return html
}

export function createHint(target: HTMLElement, options: VanillaHintOptions): HintInstance {
  const placement = (options.placement ?? 'right') as Placement
  const trigger = options.trigger ?? 'hover'

  const popover = document.createElement('div')
  popover.className = 'gk-hint-popover'
  popover.setAttribute('role', 'tooltip')
  popover.style.cssText = `
    position: fixed;
    z-index: 9500;
    background: var(--gk-bg, #ffffff);
    color: var(--gk-text, #1f2937);
    border: 1px solid var(--gk-border, #e5e7eb);
    border-radius: var(--gk-radius, 8px);
    box-shadow: var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12));
    padding: 12px 16px;
    max-width: 280px;
    font-size: 14px;
    line-height: 1.5;
    font-family: var(--gk-font, inherit);
    visibility: hidden;
    pointer-events: none;
  `
  popover.innerHTML = buildPopoverHTML(options.content)

  let removePortal: (() => void) | null = null
  let cleanupPosition: (() => void) | null = null
  let isFirstPosition = true

  const show = () => {
    if (!removePortal) {
      isFirstPosition = true
      removePortal = portal(popover)
    }
    cleanupPosition = autoUpdatePosition(
      target,
      popover,
      placement,
      ({ x, y }) => {
        popover.style.left = `${x}px`
        popover.style.top = `${y}px`
        if (isFirstPosition) {
          popover.style.visibility = 'visible'
          isFirstPosition = false
        }
      }
    )
  }

  const hide = () => {
    cleanupPosition?.()
    cleanupPosition = null
    popover.style.visibility = 'hidden'
    removePortal?.()
    removePortal = null
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  const onClickOutside = (e: MouseEvent) => {
    if (!popover.contains(e.target as Node) && e.target !== target) {
      hide()
    }
  }

  if (trigger === 'hover') {
    target.addEventListener('mouseenter', show)
    target.addEventListener('mouseleave', hide)
  } else if (trigger === 'click') {
    target.addEventListener('click', (e) => {
      e.stopPropagation()
      if (popover.style.visibility === 'visible') {
        hide()
      } else {
        show()
        setTimeout(() => document.addEventListener('click', onClickOutside, { once: true }), 0)
      }
    })
  } else if (trigger === 'focus') {
    target.addEventListener('focus', show)
    target.addEventListener('blur', hide)
  }

  const destroy = () => {
    hide()
    if (trigger === 'hover') {
      target.removeEventListener('mouseenter', show)
      target.removeEventListener('mouseleave', hide)
    } else if (trigger === 'focus') {
      target.removeEventListener('focus', show)
      target.removeEventListener('blur', hide)
    }
    document.removeEventListener('click', onClickOutside)
  }

  return { show, hide, destroy }
}
