import { autoUpdate } from '@floating-ui/dom'

export class OverlayManager {
  private static overlayEl: HTMLDivElement | null = null
  private static svgEl: SVGSVGElement | null = null
  private static cleanupAutoUpdate: (() => void) | null = null

  static show(
    targetEl: Element,
    padding: number = 8,
    opacity: number = 0.65
  ): void {
    this.hide()

    const overlay = document.createElement('div')
    overlay.id = 'gk-overlay'
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9000;
      pointer-events: all;
      transition: opacity 0.2s ease;
      opacity: 0;
    `

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask')
    mask.setAttribute('id', 'gk-spotlight-mask')

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bgRect.setAttribute('x', '0')
    bgRect.setAttribute('y', '0')
    bgRect.setAttribute('width', '100%')
    bgRect.setAttribute('height', '100%')
    bgRect.setAttribute('fill', 'white')

    const spotlightRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    spotlightRect.setAttribute('id', 'gk-spotlight-rect')
    spotlightRect.setAttribute('rx', '4')
    spotlightRect.setAttribute('fill', 'black')

    mask.appendChild(bgRect)
    mask.appendChild(spotlightRect)
    defs.appendChild(mask)
    svg.appendChild(defs)

    const overlayRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    overlayRect.setAttribute('x', '0')
    overlayRect.setAttribute('y', '0')
    overlayRect.setAttribute('width', '100%')
    overlayRect.setAttribute('height', '100%')
    overlayRect.setAttribute('fill', `rgba(0,0,0,${opacity})`)
    overlayRect.setAttribute('mask', 'url(#gk-spotlight-mask)')
    svg.appendChild(overlayRect)

    overlay.appendChild(svg)
    document.body.appendChild(overlay)

    this.overlayEl = overlay
    this.svgEl = svg

    this.updateSpotlight(targetEl, padding)

    // Keep spotlight aligned when target moves due to scroll or layout shift
    this.cleanupAutoUpdate = autoUpdate(
      targetEl,
      overlay,
      () => this.updateSpotlight(targetEl, padding)
    )

    requestAnimationFrame(() => {
      if (this.overlayEl) {
        this.overlayEl.style.opacity = '1'
      }
    })
  }

  static hide(): void {
    this.cleanupAutoUpdate?.()
    this.cleanupAutoUpdate = null
    if (this.overlayEl) {
      this.overlayEl.remove()
      this.overlayEl = null
      this.svgEl = null
    }
  }

  static update(targetEl: Element, padding: number = 8): void {
    if (!this.overlayEl) return
    this.updateSpotlight(targetEl, padding)
  }

  private static updateSpotlight(targetEl: Element, padding: number): void {
    const rect = targetEl.getBoundingClientRect()
    const spotlightRect = document.getElementById('gk-spotlight-rect')
    if (!spotlightRect) return

    spotlightRect.setAttribute('x', String(rect.left - padding))
    spotlightRect.setAttribute('y', String(rect.top - padding))
    spotlightRect.setAttribute('width', String(rect.width + padding * 2))
    spotlightRect.setAttribute('height', String(rect.height + padding * 2))
  }
}
