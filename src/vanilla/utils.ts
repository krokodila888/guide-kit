import { computePosition } from '../core/positioning'
import type { Placement } from '../core/positioning'

/** Creates an element with attributes and inline styles in one call. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  styles: Partial<CSSStyleDeclaration> = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value)
  }
  Object.assign(element.style, styles)
  return element
}

const GK_DEFAULTS: Record<string, string> = {
  '--gk-primary':    '#2563eb',
  '--gk-bg':         '#ffffff',
  '--gk-text':       '#1f2937',
  '--gk-text-muted': '#6b7280',
  '--gk-border':     '#e5e7eb',
  '--gk-radius':     '8px',
  '--gk-shadow':     '0 4px 24px rgba(0,0,0,0.12)',
  '--gk-overlay':    'rgba(0,0,0,0.65)',
  '--gk-font':       'inherit',
}

/** Registers default --gk-* CSS variables on an element as fallback values. */
export function applyGkDefaults(element: HTMLElement): void {
  for (const [key, value] of Object.entries(GK_DEFAULTS)) {
    element.style.setProperty(key, value)
  }
}

/** Appends element to document.body and returns a cleanup function. */
export function portal(element: HTMLElement): () => void {
  document.body.appendChild(element)
  return () => element.remove()
}

/** Escapes a string for safe insertion into innerHTML. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Computes position via core/positioning and applies left/top to the
 * floating element. The element must already be in the DOM (visibility:hidden
 * is fine) so that @floating-ui can read its dimensions.
 */
export async function applyPosition(
  reference: Element,
  floating: HTMLElement,
  placement: string,
): Promise<void> {
  const { x, y } = await computePosition(reference, floating, placement as Placement)
  floating.style.left = `${x}px`
  floating.style.top = `${y}px`
}
