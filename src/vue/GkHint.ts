import { defineComponent, h, ref, watch, onUnmounted, Teleport } from 'vue'
import { autoUpdatePosition } from '../core/positioning'
import type { Placement } from '../core/positioning'
import type { HintContent } from './types'

const markerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  background: 'var(--gk-primary, #2563eb)',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 'bold',
  cursor: 'pointer',
  flexShrink: '0',
  lineHeight: '1',
  border: 'none',
  padding: '0',
  fontFamily: 'inherit',
}

function buildPopoverContent(content: string | HintContent) {
  if (typeof content === 'string') {
    return [h('div', { style: { fontSize: '14px', lineHeight: '1.5' } }, content)]
  }
  const nodes = []
  if (content.title) {
    nodes.push(h('div', { style: { fontWeight: '600', marginBottom: '6px', fontSize: '14px' } }, content.title))
  }
  nodes.push(h('div', { style: { fontSize: '14px', lineHeight: '1.5' } }, content.description))
  if (content.range || content.unit) {
    const rangeText = [content.range, content.unit].filter(Boolean).join(' ')
    nodes.push(h('div', {
      style: { marginTop: '6px', color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' },
    }, `Range: ${rangeText}`))
  }
  if (content.norm) {
    nodes.push(h('div', {
      style: { marginTop: '4px', color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' },
    }, `Standard: ${content.norm}`))
  }
  return nodes
}

export const GkHint = defineComponent({
  name: 'GkHint',
  props: {
    content:   { type: [String, Object], required: true },
    placement: { type: String, default: 'right' },
    trigger:   { type: String, default: 'hover' },
  },
  setup(props, { slots }) {
    const referenceEl = ref<HTMLElement | null>(null)
    const floatingEl  = ref<HTMLElement | null>(null)
    const isOpen      = ref(false)
    const x           = ref(0)
    const y           = ref(0)
    const positioned  = ref(false)
    let cleanup: (() => void) | null = null

    watch(isOpen, (open) => {
      cleanup?.()
      cleanup = null
      positioned.value = false
      if (open && referenceEl.value && floatingEl.value) {
        cleanup = autoUpdatePosition(
          referenceEl.value,
          floatingEl.value,
          (props.placement ?? 'right') as Placement,
          (pos) => { x.value = pos.x; y.value = pos.y; positioned.value = true },
        )
      }
    })

    onUnmounted(() => { cleanup?.(); cleanup = null })

    return () => {
      const trigger = (props.trigger ?? 'hover') as string
      const triggerHandlers: Record<string, unknown> =
        trigger === 'hover'
          ? { onMouseenter: () => { isOpen.value = true }, onMouseleave: () => { isOpen.value = false } }
          : trigger === 'click'
            ? { onClick: (e: Event) => { e.stopPropagation(); isOpen.value = !isOpen.value } }
            : { onFocus: () => { isOpen.value = true }, onBlur: () => { isOpen.value = false } }

      const popoverStyle = {
        position: 'fixed' as const,
        left: `${x.value}px`,
        top: `${y.value}px`,
        background: 'var(--gk-bg, #ffffff)',
        color: 'var(--gk-text, #1f2937)',
        border: '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
        padding: '12px 16px',
        maxWidth: '280px',
        zIndex: '9999',
        fontFamily: 'var(--gk-font, inherit)',
        visibility: (isOpen.value && positioned.value ? 'visible' : 'hidden') as 'visible' | 'hidden',
        pointerEvents: 'none' as const,
      }

      return [
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } }, [
          slots.default?.(),
          h('button', {
            type: 'button',
            ref: referenceEl,
            style: markerStyle,
            'aria-label': 'Hint',
            ...triggerHandlers,
          }, '?'),
        ]),
        h(Teleport, { to: 'body' }, [
          h('div', {
            ref: floatingEl,
            role: 'tooltip',
            style: popoverStyle,
          }, buildPopoverContent(props.content as string | HintContent)),
        ]),
      ]
    }
  },
})
