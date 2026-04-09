import { OverlayManager } from '../core/overlay'
import { portal, applyPosition, escapeHtml } from './utils'
import type { VanillaTourOptions, TourInstance } from './index.types'

export function createTour(options: VanillaTourOptions): TourInstance {
  const {
    steps,
    spotlightPadding = 8,
    overlayOpacity = 0.65,
    onComplete,
    onSkip,
    onStepChange,
    locale = {},
  } = options

  const L = {
    next: locale.next ?? 'Далее',
    back: locale.back ?? 'Назад',
    skip: locale.skip ?? 'Пропустить',
    done: locale.done ?? 'Готово',
    of:   locale.of   ?? 'из',
  }

  let currentStep = -1
  let isRunning = false
  let removePortal: (() => void) | null = null

  // ── Build popover DOM ──────────────────────────────────────────────────────

  const popover = document.createElement('div')
  popover.className = 'gk-tour-popover'
  popover.style.cssText = `
    position: fixed;
    z-index: 10000;
    background: var(--gk-bg, #ffffff);
    color: var(--gk-text, #1f2937);
    border: 1px solid var(--gk-border, #e5e7eb);
    border-radius: var(--gk-radius, 8px);
    box-shadow: var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12));
    padding: 0;
    width: 320px;
    font-family: var(--gk-font, inherit);
    font-size: 14px;
    display: none;
  `

  // We build inner HTML on each step update; hold references to interactive parts.
  let btnSkip: HTMLButtonElement
  let btnBack: HTMLButtonElement
  let btnNext: HTMLButtonElement

  function renderPopover(index: number) {
    const step = steps[index]
    const isLast = index === steps.length - 1
    const isFirst = index === 0
    const titleHtml = step.title
      ? `<span class="gk-tour-title" style="font-weight:600;font-size:14px">${escapeHtml(step.title)}</span>`
      : ''

    popover.innerHTML = `
      <div class="gk-tour-header" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px 0">
        ${titleHtml}
        <span class="gk-tour-progress" style="font-size:12px;color:var(--gk-text-muted,#6b7280);margin-left:auto">
          ${index + 1} ${L.of} ${steps.length}
        </span>
      </div>
      <div class="gk-tour-content" style="padding:10px 16px 14px;line-height:1.5">
        ${escapeHtml(step.content)}
      </div>
      <div class="gk-tour-footer" style="
        display:flex;justify-content:space-between;align-items:center;
        padding:10px 16px;border-top:1px solid var(--gk-border,#e5e7eb);gap:8px
      ">
        <button class="gk-btn-skip" type="button" style="
          background:none;border:none;cursor:pointer;font-size:13px;
          color:var(--gk-text-muted,#6b7280);padding:0;font-family:inherit
        ">${L.skip}</button>
        <div style="display:flex;gap:8px">
          <button class="gk-btn-back" type="button" style="
            background:none;border:1px solid var(--gk-border,#e5e7eb);
            border-radius:var(--gk-radius,8px);cursor:pointer;font-size:13px;
            color:var(--gk-text,#1f2937);padding:6px 12px;font-family:inherit;
            ${isFirst ? 'visibility:hidden' : ''}
          ">← ${L.back}</button>
          <button class="gk-btn-next" type="button" style="
            background:var(--gk-primary,#2563eb);border:none;color:#fff;
            border-radius:var(--gk-radius,8px);cursor:pointer;font-size:13px;
            padding:6px 12px;font-weight:500;font-family:inherit
          ">${isLast ? L.done : `${L.next} →`}</button>
        </div>
      </div>
    `

    btnSkip = popover.querySelector('.gk-btn-skip')!
    btnBack = popover.querySelector('.gk-btn-back')!
    btnNext = popover.querySelector('.gk-btn-next')!

    btnSkip.addEventListener('click', () => { stop(); onSkip?.() })
    btnBack.addEventListener('click', () => back())
    btnNext.addEventListener('click', () => {
      if (isLast) { stop(); onComplete?.() } else { next() }
    })
  }

  // ── Step navigation ────────────────────────────────────────────────────────

  async function showStep(index: number) {
    const step = steps[index]
    if (!step) return

    await step.beforeShow?.()

    const targetEl = document.querySelector<HTMLElement>(step.target)
    if (!targetEl) {
      console.warn(`[guide-kit] Tour: element not found: "${step.target}"`)
      return
    }

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    OverlayManager.show(targetEl, spotlightPadding, overlayOpacity)

    currentStep = index
    renderPopover(index)
    popover.style.display = 'block'

    await applyPosition(targetEl, popover, step.placement ?? 'bottom')
    onStepChange?.(index)
  }

  // ── Keyboard handler ───────────────────────────────────────────────────────

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isRunning) return
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next() }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
    else if (e.key === 'Escape') { stop(); onSkip?.() }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  function start() {
    if (isRunning) return
    isRunning = true
    removePortal = portal(popover)
    document.addEventListener('keydown', onKeyDown)
    showStep(0)
  }

  function stop() {
    if (!isRunning) return
    isRunning = false
    currentStep = -1
    OverlayManager.hide()
    popover.style.display = 'none'
    removePortal?.()
    removePortal = null
    document.removeEventListener('keydown', onKeyDown)
  }

  function next() {
    if (currentStep < steps.length - 1) showStep(currentStep + 1)
  }

  function back() {
    if (currentStep > 0) showStep(currentStep - 1)
  }

  function goTo(index: number) {
    if (index >= 0 && index < steps.length) showStep(index)
  }

  function destroy() {
    stop()
    document.removeEventListener('keydown', onKeyDown)
  }

  return { start, stop, next, back, goTo, destroy }
}
