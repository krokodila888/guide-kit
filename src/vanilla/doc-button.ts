import { portal, escapeHtml } from './utils'
import type { VanillaDocButtonOptions, VanillaDocItem, DocButtonInstance } from './index.types'

function fileIconSvg(fileType?: VanillaDocItem['fileType']): string {
  const color =
    fileType === 'pdf'  ? '#dc2626' :
    fileType === 'docx' ? '#2563eb' :
    fileType === 'xlsx' ? '#16a34a' :
    '#6b7280'

  const label =
    fileType === 'pdf'  ? '<text x="3.5" y="11" font-size="3.5" font-weight="bold" fill="' + color + '" font-family="sans-serif">PDF</text>' :
    fileType === 'docx' ? '<text x="2.5" y="11" font-size="3" font-weight="bold" fill="' + color + '" font-family="sans-serif">DOCX</text>' :
    fileType === 'xlsx' ? '<text x="2.5" y="11" font-size="3" font-weight="bold" fill="' + color + '" font-family="sans-serif">XLSX</text>' :
    ''

  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;vertical-align:middle">
    <rect x="2" y="1" width="9" height="13" rx="1" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="M9 1v4h4" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="M9 1l4 4" stroke="${color}" stroke-width="1.5"/>
    ${label}
  </svg>`
}

function downloadDoc(doc: VanillaDocItem) {
  const a = document.createElement('a')
  a.href = doc.url
  a.download = doc.filename ?? doc.label
  a.click()
}

const btnStyle = `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--gk-radius, 8px);
  border: 1px solid var(--gk-border, #e5e7eb);
  background: var(--gk-bg, #ffffff);
  color: var(--gk-text, #1f2937);
  cursor: pointer;
  font-size: 14px;
  font-family: var(--gk-font, inherit);
`

export function createDocButton(
  container: HTMLElement,
  options: VanillaDocButtonOptions,
): DocButtonInstance {
  const { label = 'Документация', variant = 'button' } = options
  const docList = Array.isArray(options.docs) ? options.docs : [options.docs]
  const isSingle = docList.length === 1

  let removeDropdownPortal: (() => void) | null = null

  const closeDropdown = () => {
    removeDropdownPortal?.()
    removeDropdownPortal = null
    document.removeEventListener('click', onClickOutside)
  }

  const onClickOutside = (e: MouseEvent) => {
    if (!container.contains(e.target as Node)) closeDropdown()
  }

  if (variant === 'inline' && isSingle) {
    const doc = docList[0]
    container.innerHTML = `
      <a href="${escapeHtml(doc.url)}"
         download="${escapeHtml(doc.filename ?? doc.label)}"
         style="display:inline-flex;align-items:center;gap:4px;
                color:var(--gk-primary,#2563eb);font-size:14px;
                text-decoration:none;font-family:var(--gk-font,inherit)">
        ${fileIconSvg(doc.fileType)}
        ${escapeHtml(doc.label)}
      </a>
    `
  } else if (isSingle) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.style.cssText = btnStyle
    btn.innerHTML = `${fileIconSvg(docList[0].fileType)} ${escapeHtml(label)}`
    btn.addEventListener('click', () => downloadDoc(docList[0]))
    container.appendChild(btn)
  } else {
    // Multiple docs — button + portal dropdown
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.style.cssText = btnStyle
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
        <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M9 1v4h4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M9 1l4 4" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      ${escapeHtml(label)} <span class="gk-doc-arrow">▾</span>
    `
    container.appendChild(btn)

    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      if (removeDropdownPortal) {
        closeDropdown()
        btn.querySelector<HTMLSpanElement>('.gk-doc-arrow')!.textContent = '▾'
        return
      }

      const dropdown = document.createElement('div')
      dropdown.style.cssText = `
        position: fixed;
        background: var(--gk-bg, #ffffff);
        border: 1px solid var(--gk-border, #e5e7eb);
        border-radius: var(--gk-radius, 8px);
        box-shadow: var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12));
        z-index: 10002;
        min-width: 220px;
        padding: 4px;
        font-family: var(--gk-font, inherit);
      `

      docList.forEach(doc => {
        const item = document.createElement('button')
        item.type = 'button'
        item.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: var(--gk-text, #1f2937);
          border-radius: 6px;
          text-align: left;
          font-family: inherit;
        `
        item.innerHTML = `
          ${fileIconSvg(doc.fileType)}
          <span style="flex:1">${escapeHtml(doc.label)}</span>
          ${doc.size ? `<span style="color:var(--gk-text-muted,#6b7280);font-size:12px">${escapeHtml(doc.size)}</span>` : ''}
        `
        item.addEventListener('mouseenter', () => { item.style.background = 'var(--gk-border, #e5e7eb)' })
        item.addEventListener('mouseleave', () => { item.style.background = 'none' })
        item.addEventListener('click', () => { downloadDoc(doc); closeDropdown() })
        dropdown.appendChild(item)
      })

      // Position dropdown below button
      const rect = btn.getBoundingClientRect()
      dropdown.style.top = `${rect.bottom + 4}px`
      dropdown.style.left = `${rect.left}px`

      removeDropdownPortal = portal(dropdown)
      btn.querySelector<HTMLSpanElement>('.gk-doc-arrow')!.textContent = '▴'
      setTimeout(() => document.addEventListener('click', onClickOutside), 0)
    })
  }

  return {
    destroy: () => {
      closeDropdown()
      container.innerHTML = ''
    },
  }
}
