import { escapeHtml } from './utils'
import type { VanillaFormulaOptions, FormulaInstance } from './index.types'

const formulaContainerStyle = `
  font-family: var(--gk-font, inherit);
  font-size: 14px;
  color: var(--gk-text, #1f2937);
`

const fractionStyle = `
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  vertical-align: middle;
  margin: 0 4px;
`

function buildVariablesHtml(variables: NonNullable<VanillaFormulaOptions['variables']>): string {
  const rows = variables.map(v => `
    <tr>
      <td style="padding:4px 12px 4px 0;font-weight:600;white-space:nowrap">${escapeHtml(v.symbol)}</td>
      <td style="padding:4px 12px 4px 0;color:var(--gk-text,#1f2937)">${escapeHtml(v.description)}</td>
      ${v.unit ? `<td style="padding:4px 0;color:var(--gk-text-muted,#6b7280)">${escapeHtml(v.unit)}</td>` : '<td></td>'}
    </tr>
  `).join('')
  return `<table style="border-collapse:collapse;font-size:13px;margin-top:4px">${rows}</table>`
}

export function createFormulaBlock(
  container: HTMLElement,
  options: VanillaFormulaOptions,
): FormulaInstance {
  container.style.fontFamily = 'var(--gk-font, inherit)'

  let formulaHtml = ''

  if (options.mode === 'html') {
    // content is trusted — document this in API
    formulaHtml = `
      <div class="gk-formula-display" style="
        background: var(--gk-border, #e5e7eb);
        border-radius: var(--gk-radius, 8px);
        padding: 12px 16px;
        margin-bottom: 8px;
        overflow-x: auto;
      ">
        <span class="gk-formula-html">${options.html}</span>
      </div>
    `
  } else {
    const num = escapeHtml(options.numerator)
    const den = escapeHtml(options.denominator)
    const res = options.result ? escapeHtml(options.result) : ''
    formulaHtml = `
      <div class="gk-formula-display" style="
        background: var(--gk-border, #e5e7eb);
        border-radius: var(--gk-radius, 8px);
        padding: 12px 16px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
      ">
        <span style="${fractionStyle}">
          <span style="padding:0 4px;border-bottom:1.5px solid var(--gk-text,#1f2937)">${num}</span>
          <span style="padding:0 4px">${den}</span>
        </span>
        ${res ? `<span style="margin-left:4px">= ${res}</span>` : ''}
      </div>
    `
  }

  const variables = options.variables
  let variablesHtml = ''
  if (variables && variables.length > 0) {
    const toggleId = `gk-vars-${Math.random().toString(36).slice(2)}`
    variablesHtml = `
      <div>
        <button type="button" class="gk-vars-toggle" data-target="${toggleId}" style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          color: var(--gk-primary, #2563eb);
          padding: 0;
          font-family: inherit;
          margin-bottom: 4px;
        ">Variables ▸</button>
        <div id="${toggleId}" style="display:none">
          ${buildVariablesHtml(variables)}
        </div>
      </div>
    `
  }

  const sourceHtml = options.source
    ? `<div class="gk-formula-source" style="font-size:12px;color:var(--gk-text-muted,#6b7280);font-style:italic;margin-top:6px">Source: ${escapeHtml(options.source)}</div>`
    : ''

  container.innerHTML = `
    <div style="${formulaContainerStyle}">
      ${formulaHtml}
      ${variablesHtml}
      ${sourceHtml}
    </div>
  `

  // Wire toggle button
  const toggleBtn = container.querySelector<HTMLButtonElement>('.gk-vars-toggle')
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const targetId = toggleBtn.getAttribute('data-target')!
      const panel = document.getElementById(targetId)
      if (!panel) return
      const isOpen = panel.style.display !== 'none'
      panel.style.display = isOpen ? 'none' : 'block'
      toggleBtn.textContent = isOpen ? 'Variables ▸' : 'Variables ▾'
    })
  }

  return {
    destroy: () => { container.innerHTML = '' },
  }
}
