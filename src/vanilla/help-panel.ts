import { HelpStorage } from '../core/storage'
import { portal, escapeHtml } from './utils'
import type {
  VanillaHelpPanelOptions,
  VanillaHelpItem,
  VanillaHelpItemType,
  HelpPanelInstance,
} from './index.types'

// ─── Icons ────────────────────────────────────────────────────────────────────

function typeIconSvg(type: VanillaHelpItemType): string {
  switch (type) {
    case 'tour':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>`
    case 'hint':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18h6"/><path d="M10 22h4"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
      </svg>`
    case 'sidebar':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>`
    case 'doc':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>`
    case 'video':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
    default:
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`
  }
}

// ─── Toggle button (sliding pill, like React version) ─────────────────────────

function buildToggle(checked: boolean, onChange: (v: boolean) => void): HTMLElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.setAttribute('role', 'switch')
  btn.setAttribute('aria-checked', String(checked))

  const apply = (val: boolean) => {
    btn.setAttribute('aria-checked', String(val))
    btn.style.background = val ? 'var(--gk-primary, #2563eb)' : '#d1d5db'
    circle.style.transform = val ? 'translateX(16px)' : 'translateX(0)'
  }

  btn.style.cssText = `
    display: inline-flex;
    align-items: center;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: ${checked ? 'var(--gk-primary, #2563eb)' : '#d1d5db'};
    border: none;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;
    transition: background 0.2s ease;
  `

  const circle = document.createElement('span')
  circle.style.cssText = `
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transform: ${checked ? 'translateX(16px)' : 'translateX(0)'};
    transition: transform 0.2s ease;
  `
  btn.appendChild(circle)

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const next = btn.getAttribute('aria-checked') !== 'true'
    apply(next)
    onChange(next)
  })

  return btn
}

// ─── Position helpers ─────────────────────────────────────────────────────────

type Position = NonNullable<VanillaHelpPanelOptions['position']>

function btnCss(pos: Position): string {
  const base = 'position:fixed;z-index:10001'
  if (pos === 'bottom-right') return `${base};bottom:16px;right:16px`
  if (pos === 'bottom-left')  return `${base};bottom:16px;left:16px`
  if (pos === 'top-right')    return `${base};top:16px;right:16px`
  return `${base};top:16px;left:16px`
}

function panelCss(pos: Position): string {
  const gap = 64 // button height + gap
  const base = 'position:fixed;z-index:10000;width:280px'
  if (pos === 'bottom-right') return `${base};bottom:${gap}px;right:16px`
  if (pos === 'bottom-left')  return `${base};bottom:${gap}px;left:16px`
  if (pos === 'top-right')    return `${base};top:${gap}px;right:16px`
  return `${base};top:${gap}px;left:16px`
}

// ─── createHelpPanel ──────────────────────────────────────────────────────────

export function createHelpPanel(options: VanillaHelpPanelOptions): HelpPanelInstance {
  const {
    items,
    position = 'bottom-right',
    label = 'Помощь',
    storageKey = 'guide-kit-help',
    persistState = true,
    onItemActivate,
    onItemToggle,
  } = options

  // Enabled state — initialise from storage
  const enabledState: Record<string, boolean> = persistState
    ? HelpStorage.getEnabled(storageKey)
    : {}

  const isEnabled = (id: string): boolean => {
    if (id in enabledState) return enabledState[id]
    const item = items.find(i => i.id === id)
    return item?.defaultEnabled ?? true
  }

  const setEnabled = (id: string, value: boolean) => {
    enabledState[id] = value
    if (persistState) HelpStorage.setEnabled(id, value, storageKey)
    onItemToggle?.(id, value)
    if (panelEl) refreshPanel()
  }

  // ── Trigger button ─────────────────────────────────────────────────────────

  const triggerBtn = document.createElement('button')
  triggerBtn.type = 'button'
  triggerBtn.style.cssText = `
    ${btnCss(position)};
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--gk-primary, #2563eb);
    color: #fff;
    border: none;
    border-radius: 24px;
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: var(--gk-font, inherit);
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  `

  const helpIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`
  const closeIconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`

  const removeTrigger = portal(triggerBtn)
  triggerBtn.innerHTML = `${helpIconSvg} ${escapeHtml(label)}`

  // ── Panel ──────────────────────────────────────────────────────────────────

  let panelEl: HTMLElement | null = null
  let removePanel: (() => void) | null = null
  let panelOpen = false

  function buildPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Панель помощи')
    panel.style.cssText = `
      ${panelCss(position)};
      background: var(--gk-bg, #ffffff);
      border: 1px solid var(--gk-border, #e5e7eb);
      border-radius: var(--gk-radius, 8px);
      box-shadow: var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12));
      font-family: var(--gk-font, inherit);
      font-size: 14px;
      overflow: hidden;
    `

    const enabledCount = items.filter(i => isEnabled(i.id)).length

    // Header
    const headerEl = document.createElement('div')
    headerEl.style.cssText = `
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--gk-border, #e5e7eb);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
    headerEl.innerHTML = `
      <span style="font-weight:600;font-size:13px;color:var(--gk-text,#1f2937)">Доступная помощь</span>
      <span style="font-size:12px;color:var(--gk-text-muted,#6b7280)">${enabledCount} из ${items.length} включено</span>
    `
    panel.appendChild(headerEl)

    // Items list
    const listEl = document.createElement('div')
    listEl.style.cssText = 'max-height:320px;overflow-y:auto'

    if (items.length === 0) {
      const empty = document.createElement('div')
      empty.style.cssText = 'padding:20px 16px;text-align:center;color:var(--gk-text-muted,#6b7280);font-size:13px'
      empty.textContent = 'Нет доступных видов помощи'
      listEl.appendChild(empty)
    } else {
      items.forEach(item => {
        const enabled = isEnabled(item.id)
        const row = document.createElement('div')
        row.style.cssText = `
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          cursor: ${enabled ? 'pointer' : 'default'};
          opacity: ${enabled ? '1' : '0.45'};
          border-bottom: 1px solid var(--gk-border, #e5e7eb);
          transition: background 0.1s;
        `
        row.addEventListener('mouseenter', () => { if (enabled) row.style.background = 'var(--gk-border, #f3f4f6)' })
        row.addEventListener('mouseleave', () => { row.style.background = '' })
        row.addEventListener('click', () => {
          if (!enabled) return
          item.action()
          onItemActivate?.(item.id)
          close()
        })

        // Type icon
        const iconSpan = document.createElement('span')
        iconSpan.style.cssText = 'color:var(--gk-primary,#2563eb);flex-shrink:0;display:flex'
        iconSpan.innerHTML = typeIconSvg(item.type)

        // Label + description
        const textDiv = document.createElement('div')
        textDiv.style.cssText = 'flex:1;min-width:0'
        textDiv.innerHTML = `
          <div style="font-weight:500;font-size:13px;color:var(--gk-text,#1f2937);line-height:1.3">${escapeHtml(item.label)}</div>
          ${item.description ? `<div style="font-size:12px;color:var(--gk-text-muted,#6b7280);margin-top:2px;line-height:1.3">${escapeHtml(item.description)}</div>` : ''}
        `

        // Toggle
        const toggle = buildToggle(enabled, (val) => setEnabled(item.id, val))

        row.appendChild(iconSpan)
        row.appendChild(textDiv)
        row.appendChild(toggle)
        listEl.appendChild(row)
      })
    }
    panel.appendChild(listEl)

    // Footer
    const footer = document.createElement('div')
    footer.style.cssText = 'padding:8px 16px;border-top:1px solid var(--gk-border,#e5e7eb)'
    const resetBtn = document.createElement('button')
    resetBtn.type = 'button'
    resetBtn.textContent = 'Сбросить настройки'
    resetBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--gk-text-muted, #6b7280);
      padding: 0;
      text-decoration: underline;
      font-family: inherit;
    `
    resetBtn.addEventListener('click', () => {
      if (persistState) HelpStorage.reset(storageKey)
      items.forEach(item => {
        delete enabledState[item.id]
      })
      refreshPanel()
    })
    footer.appendChild(resetBtn)
    panel.appendChild(footer)

    return panel
  }

  function refreshPanel() {
    if (!panelOpen) return
    const newPanel = buildPanel()
    panelEl?.replaceWith(newPanel)
    panelEl = newPanel
    removePanel = () => newPanel.remove()
  }

  function open() {
    if (panelOpen) return
    panelOpen = true
    panelEl = buildPanel()
    removePanel = portal(panelEl)
    triggerBtn.innerHTML = `${closeIconSvg} Закрыть`
    triggerBtn.setAttribute('aria-expanded', 'true')
    setTimeout(() => document.addEventListener('pointerdown', onClickOutside), 0)
  }

  function close() {
    if (!panelOpen) return
    panelOpen = false
    removePanel?.()
    removePanel = null
    panelEl = null
    triggerBtn.innerHTML = `${helpIconSvg} ${escapeHtml(label)}`
    triggerBtn.setAttribute('aria-expanded', 'false')
    document.removeEventListener('pointerdown', onClickOutside)
  }

  const onClickOutside = (e: PointerEvent) => {
    if (
      panelEl && !panelEl.contains(e.target as Node) &&
      !triggerBtn.contains(e.target as Node)
    ) {
      close()
    }
  }

  triggerBtn.addEventListener('click', () => {
    if (panelOpen) close(); else open()
  })

  function destroy() {
    close()
    removeTrigger()
    document.removeEventListener('pointerdown', onClickOutside)
  }

  return { open, close, isEnabled, setEnabled, destroy }
}
