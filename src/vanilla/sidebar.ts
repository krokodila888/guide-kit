import { portal, escapeHtml } from './utils'
import { createFormulaBlock } from './formula'
import { createDocButton } from './doc-button'
import { createVideoPanel } from './video-panel'
import type {
  VanillaSidebarOptions,
  VanillaSidebarSection,
  SidebarInstance,
} from './index.types'

// ─── Section renderers ────────────────────────────────────────────────────────

function renderTextSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  div.style.cssText = 'font-size:14px;line-height:1.6;color:var(--gk-text,#1f2937)'
  // content may be plain text or trusted HTML from consumer
  div.innerHTML = section.content ?? ''
  return div
}

function renderStepsSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  const steps = section.steps ?? []
  steps.forEach((step, i) => {
    const item = document.createElement('div')
    item.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;align-items:flex-start'
    item.innerHTML = `
      <span style="
        display:flex;align-items:center;justify-content:center;
        min-width:22px;height:22px;border-radius:50%;
        background:${step.done ? 'var(--gk-primary,#2563eb)' : 'var(--gk-border,#e5e7eb)'};
        color:${step.done ? '#fff' : 'var(--gk-text-muted,#6b7280)'};
        font-size:12px;font-weight:600;flex-shrink:0
      ">${i + 1}</span>
      <div>
        <div style="font-size:14px;font-weight:${step.done ? '400' : '500'};
          color:${step.done ? 'var(--gk-text-muted,#6b7280)' : 'var(--gk-text,#1f2937)'};
          text-decoration:${step.done ? 'line-through' : 'none'}"
        >${escapeHtml(step.label)}</div>
        ${step.description ? `<div style="font-size:12px;color:var(--gk-text-muted,#6b7280);margin-top:2px">${escapeHtml(step.description)}</div>` : ''}
      </div>
    `
    div.appendChild(item)
  })
  return div
}

function renderChecklistSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  const items = section.items ?? []
  const checkboxStates = new Map<string, boolean>(
    items.map(it => [it.id, it.checked ?? false])
  )

  items.forEach(item => {
    const row = document.createElement('label')
    row.style.cssText = 'display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:8px;font-size:14px'

    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = item.checked ?? false
    cb.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--gk-primary,#2563eb)'

    const labelText = document.createElement('span')
    labelText.textContent = item.label
    labelText.style.color = 'var(--gk-text,#1f2937)'

    cb.addEventListener('change', () => {
      checkboxStates.set(item.id, cb.checked)
      labelText.style.textDecoration = cb.checked ? 'line-through' : 'none'
      labelText.style.color = cb.checked ? 'var(--gk-text-muted,#6b7280)' : 'var(--gk-text,#1f2937)'
      section.onItemChange?.(item.id, cb.checked)
    })

    if (item.checked) {
      labelText.style.textDecoration = 'line-through'
      labelText.style.color = 'var(--gk-text-muted,#6b7280)'
    }

    row.appendChild(cb)
    row.appendChild(labelText)
    div.appendChild(row)
  })

  return div
}

function renderFormulaSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  if (section.formulaOptions) {
    createFormulaBlock(div, section.formulaOptions)
  }
  return div
}

function renderDocSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  if (section.docOptions) {
    createDocButton(div, section.docOptions)
  }
  return div
}

function renderVideoSection(section: VanillaSidebarSection): HTMLElement {
  const div = document.createElement('div')
  if (section.videoOptions) {
    createVideoPanel(div, section.videoOptions)
  }
  return div
}

// ─── Section wrapper with optional title + collapsible ────────────────────────

function buildSectionWrapper(section: VanillaSidebarSection): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    border-bottom: 1px solid var(--gk-border, #e5e7eb);
    padding: 12px 16px;
  `

  let bodyEl: HTMLElement
  switch (section.type) {
    case 'text':      bodyEl = renderTextSection(section);     break
    case 'steps':     bodyEl = renderStepsSection(section);    break
    case 'checklist': bodyEl = renderChecklistSection(section); break
    case 'formula':   bodyEl = renderFormulaSection(section);  break
    case 'doc':       bodyEl = renderDocSection(section);      break
    case 'video':     bodyEl = renderVideoSection(section);    break
    default:          bodyEl = document.createElement('div')
  }

  if (section.title) {
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    `
    const titleEl = document.createElement('span')
    titleEl.textContent = section.title
    titleEl.style.cssText = 'font-weight:600;font-size:13px;color:var(--gk-text,#1f2937)'
    header.appendChild(titleEl)

    if (section.collapsible) {
      const arrow = document.createElement('button')
      arrow.type = 'button'
      arrow.textContent = '▾'
      arrow.style.cssText = `
        background:none;border:none;cursor:pointer;font-size:12px;
        color:var(--gk-text-muted,#6b7280);padding:0;font-family:inherit
      `
      let collapsed = false
      arrow.addEventListener('click', () => {
        collapsed = !collapsed
        bodyEl.style.display = collapsed ? 'none' : 'block'
        arrow.textContent = collapsed ? '▸' : '▾'
      })
      header.appendChild(arrow)
    }

    wrapper.appendChild(header)
  }

  wrapper.appendChild(bodyEl)
  return wrapper
}

// ─── createSidebar ─────────────────────────────────────────────────────────────

export function createSidebar(options: VanillaSidebarOptions): SidebarInstance {
  const {
    sections,
    title,
    side = 'left',
    width = 320,
    showToggleButton = true,
    toggleButtonLabel = 'Учебные материалы',
    backdrop = false,
    zIndex = 9000,
    onOpen,
    onClose,
  } = options

  let isOpen = false
  const cleanupFns: Array<() => void> = []

  // ── Sidebar panel ──────────────────────────────────────────────────────────

  const panel = document.createElement('div')
  panel.style.cssText = `
    position: fixed;
    top: 0;
    bottom: 0;
    ${side === 'left' ? 'left: 0' : 'right: 0'};
    width: ${width}px;
    z-index: ${zIndex};
    background: var(--gk-bg, #ffffff);
    border-${side === 'left' ? 'right' : 'left'}: 1px solid var(--gk-border, #e5e7eb);
    display: flex;
    flex-direction: column;
    font-family: var(--gk-font, inherit);
    transform: translateX(${side === 'left' ? '-100%' : '100%'});
    transition: transform 0.25s ease;
    box-shadow: var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12));
  `

  // Header
  const header = document.createElement('div')
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--gk-border, #e5e7eb);
    flex-shrink: 0;
  `
  if (title) {
    const titleEl = document.createElement('span')
    titleEl.textContent = title
    titleEl.style.cssText = 'font-weight:600;font-size:15px;color:var(--gk-text,#1f2937)'
    header.appendChild(titleEl)
  }

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.innerHTML = '✕'
  closeBtn.setAttribute('aria-label', 'Закрыть')
  closeBtn.style.cssText = `
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: var(--gk-text-muted, #6b7280);
    padding: 4px;
    line-height: 1;
    margin-left: auto;
    font-family: inherit;
  `
  closeBtn.addEventListener('click', close)
  header.appendChild(closeBtn)
  panel.appendChild(header)

  // Body
  const body = document.createElement('div')
  body.style.cssText = 'flex:1;overflow-y:auto'
  sections.forEach(s => body.appendChild(buildSectionWrapper(s)))
  panel.appendChild(body)

  cleanupFns.push(portal(panel))

  // ── Backdrop ───────────────────────────────────────────────────────────────

  let backdropEl: HTMLElement | null = null
  let removeBackdrop: (() => void) | null = null

  if (backdrop) {
    backdropEl = document.createElement('div')
    backdropEl.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--gk-overlay, rgba(0,0,0,0.65));
      z-index: ${zIndex - 1};
      display: none;
    `
    backdropEl.addEventListener('click', close)
    removeBackdrop = portal(backdropEl)
    cleanupFns.push(removeBackdrop)
  }

  // ── Toggle tab ─────────────────────────────────────────────────────────────

  let tabEl: HTMLElement | null = null
  let removeTab: (() => void) | null = null

  if (showToggleButton) {
    tabEl = document.createElement('button')
    ;(tabEl as HTMLButtonElement).type = 'button'
    tabEl.textContent = toggleButtonLabel
    tabEl.setAttribute('aria-label', toggleButtonLabel)
    tabEl.style.cssText = `
      position: fixed;
      top: 50%;
      ${side === 'left' ? 'left: 0' : 'right: 0'};
      transform: translateY(-50%);
      writing-mode: vertical-rl;
      text-orientation: mixed;
      rotate: ${side === 'left' ? '180deg' : '0deg'};
      background: var(--gk-primary, #2563eb);
      color: #fff;
      border: none;
      cursor: pointer;
      padding: 12px 6px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px 0 0 6px;
      font-family: var(--gk-font, inherit);
      white-space: nowrap;
      line-height: 1;
      z-index: ${zIndex};
      display: block;
    `
    tabEl.addEventListener('click', open)
    removeTab = portal(tabEl)
    cleanupFns.push(removeTab)
  }

  // ── State helpers ──────────────────────────────────────────────────────────

  function open() {
    if (isOpen) return
    isOpen = true
    panel.style.transform = 'translateX(0)'
    if (backdropEl) backdropEl.style.display = 'block'
    if (tabEl) tabEl.style.display = 'none'
    onOpen?.()
  }

  function close() {
    if (!isOpen) return
    isOpen = false
    panel.style.transform = `translateX(${side === 'left' ? '-100%' : '100%'})`
    if (backdropEl) backdropEl.style.display = 'none'
    if (tabEl) tabEl.style.display = 'block'
    onClose?.()
  }

  function toggle() {
    if (isOpen) close(); else open()
  }

  function destroy() {
    cleanupFns.forEach(fn => fn())
    cleanupFns.length = 0
  }

  return { open, close, toggle, destroy }
}
