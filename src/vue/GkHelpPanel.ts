import { defineComponent, h, ref, reactive, onMounted, onUnmounted, Teleport } from 'vue'
import { HelpStorage } from '../core/storage'
import type { HelpItem, HelpItemType } from './types'

// ─── Icons ────────────────────────────────────────────────────────────────────

function typeIconSvg(type: HelpItemType): ReturnType<typeof h> {
  const svgProps = {
    width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': '2',
    style: { display: 'block' },
  }
  switch (type) {
    case 'tour':
      return h('svg', svgProps, [
        h('path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' }),
        h('line', { x1: '4', y1: '22', x2: '4', y2: '15' }),
      ])
    case 'hint':
      return h('svg', svgProps, [
        h('path', { d: 'M9 18h6' }),
        h('path', { d: 'M10 22h4' }),
        h('path', { d: 'M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14' }),
      ])
    case 'sidebar':
      return h('svg', svgProps, [
        h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }),
        h('line', { x1: '9', y1: '3', x2: '9', y2: '21' }),
      ])
    case 'doc':
      return h('svg', svgProps, [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
      ])
    case 'video':
      return h('svg', { ...svgProps, fill: 'currentColor' }, [
        h('path', { d: 'M8 5v14l11-7z' }),
      ])
    default:
      return h('svg', svgProps, [
        h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
      ])
  }
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function renderToggle(checked: boolean, onChange: () => void) {
  return h('button', {
    type:            'button',
    role:            'switch',
    'aria-checked':  String(checked),
    onClick:         (e: Event) => { e.stopPropagation(); onChange() },
    style: {
      display:      'inline-flex',
      alignItems:   'center',
      width:        '36px',
      height:       '20px',
      borderRadius: '10px',
      background:   checked ? 'var(--gk-primary, #2563eb)' : '#d1d5db',
      border:       'none',
      cursor:       'pointer',
      padding:      '2px',
      flexShrink:   '0',
      transition:   'background 0.2s ease',
    },
  }, [
    h('span', {
      style: {
        display:      'block',
        width:        '16px',
        height:       '16px',
        borderRadius: '50%',
        background:   '#fff',
        transform:    checked ? 'translateX(16px)' : 'translateX(0)',
        transition:   'transform 0.2s ease',
      },
    }),
  ])
}

// ─── Position helpers ─────────────────────────────────────────────────────────

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

function getBtnPos(pos: Position) {
  const base: Record<string, string> = { position: 'fixed', zIndex: '10001' }
  if (pos === 'bottom-right') { base.bottom = '16px'; base.right = '16px' }
  if (pos === 'bottom-left')  { base.bottom = '16px'; base.left  = '16px' }
  if (pos === 'top-right')    { base.top    = '16px'; base.right = '16px' }
  if (pos === 'top-left')     { base.top    = '16px'; base.left  = '16px' }
  return base
}

function getPanelPos(pos: Position) {
  const gap  = 64
  const base: Record<string, string> = { position: 'fixed', zIndex: '10000', width: '280px' }
  if (pos === 'bottom-right') { base.bottom = `${gap}px`; base.right = '16px' }
  if (pos === 'bottom-left')  { base.bottom = `${gap}px`; base.left  = '16px' }
  if (pos === 'top-right')    { base.top    = `${gap}px`; base.right = '16px' }
  if (pos === 'top-left')     { base.top    = `${gap}px`; base.left  = '16px' }
  return base
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GkHelpPanel = defineComponent({
  name: 'GkHelpPanel',
  props: {
    items:        { type: Array,   required: true },
    position:     { type: String,  default: 'bottom-right' },
    label:        { type: String,  default: 'Help' },
    storageKey:   { type: String,  default: 'guide-kit-help' },
    persistState: { type: Boolean, default: true },
  },
  emits: ['item-activate', 'item-toggle'],
  setup(props, { emit, expose }) {
    const isOpen  = ref(false)

    // Enabled state: initialized from localStorage
    const enabled = reactive<Record<string, boolean>>(
      props.persistState ? HelpStorage.getEnabled(props.storageKey as string) : {},
    )

    function isItemEnabled(id: string): boolean {
      if (id in enabled) return enabled[id]
      const item = (props.items as HelpItem[]).find(i => i.id === id)
      return item?.defaultEnabled ?? true
    }

    function toggleItem(id: string) {
      const next = !isItemEnabled(id)
      enabled[id] = next
      if (props.persistState) HelpStorage.setEnabled(id, next, props.storageKey as string)
      emit('item-toggle', id, next)
    }

    function activateItem(item: HelpItem) {
      if (!isItemEnabled(item.id)) return
      item.action?.()
      emit('item-activate', item.id)
      isOpen.value = false
    }

    function resetAll() {
      if (props.persistState) HelpStorage.reset(props.storageKey as string)
      const items = props.items as HelpItem[]
      items.forEach(item => { delete enabled[item.id] })
    }

    // Close on click outside
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node
      if (
        !panelRef.value?.contains(t) &&
        !btnRef.value?.contains(t)
      ) {
        isOpen.value = false
      }
    }
    const panelRef = ref<HTMLElement | null>(null)
    const btnRef   = ref<HTMLElement | null>(null)

    onMounted(()   => document.addEventListener('pointerdown', onClickOutside))
    onUnmounted(() => document.removeEventListener('pointerdown', onClickOutside))

    expose({ isEnabled: isItemEnabled })

    return () => {
      const items    = props.items as HelpItem[]
      const pos      = (props.position ?? 'bottom-right') as Position
      const label    = props.label as string
      const panelOpen = isOpen.value

      const enabledCount = items.filter(i => isItemEnabled(i.id)).length

      // Trigger button
      const triggerNode = h('button', {
        ref:     btnRef,
        type:    'button',
        onClick: () => { isOpen.value = !panelOpen },
        style: {
          ...getBtnPos(pos),
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
          background:   'var(--gk-primary, #2563eb)',
          color:        '#fff',
          border:       'none',
          borderRadius: '24px',
          padding:      '10px 16px',
          cursor:       'pointer',
          fontSize:     '14px',
          fontWeight:   '500',
          fontFamily:   'var(--gk-font, inherit)',
          boxShadow:    '0 2px 12px rgba(0,0,0,0.18)',
        },
      }, panelOpen ? '✕ Close' : `? ${label}`)

      if (!panelOpen) return h(Teleport, { to: 'body' }, [triggerNode])

      // Panel
      const rowNodes = items.length === 0
        ? [h('div', { style: { padding: '20px 16px', textAlign: 'center', color: 'var(--gk-text-muted, #6b7280)', fontSize: '13px' } }, 'No help items available')]
        : items.map(item => {
            const itemEnabled = isItemEnabled(item.id)
            return h('div', {
              key: item.id,
              onClick: () => activateItem(item),
              style: {
                display:    'flex',
                alignItems: 'center',
                gap:        '10px',
                padding:    '10px 16px',
                cursor:     itemEnabled ? 'pointer' : 'default',
                opacity:    itemEnabled ? '1' : '0.45',
                borderBottom: '1px solid var(--gk-border, #e5e7eb)',
                transition: 'background 0.1s',
              },
              onMouseenter: (e: MouseEvent) => { if (itemEnabled) (e.currentTarget as HTMLElement).style.background = 'var(--gk-border, #f3f4f6)' },
              onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '' },
            }, [
              h('span', { style: { color: 'var(--gk-primary, #2563eb)', flexShrink: '0', display: 'flex' } }, [typeIconSvg(item.type)]),
              h('div', { style: { flex: '1', minWidth: '0' } }, [
                h('div', { style: { fontWeight: '500', fontSize: '13px', color: 'var(--gk-text, #1f2937)', lineHeight: '1.3' } }, item.label),
                item.description && h('div', { style: { fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', marginTop: '2px', lineHeight: '1.3' } }, item.description),
              ]),
              renderToggle(itemEnabled, () => toggleItem(item.id)),
            ])
          })

      const panelNode = h('div', {
        ref:   panelRef,
        role:  'dialog',
        style: {
          ...getPanelPos(pos),
          background:   'var(--gk-bg, #ffffff)',
          border:       '1px solid var(--gk-border, #e5e7eb)',
          borderRadius: 'var(--gk-radius, 8px)',
          boxShadow:    'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
          fontFamily:   'var(--gk-font, inherit)',
          fontSize:     '14px',
          overflow:     'hidden',
        },
      }, [
        // Header
        h('div', { style: { padding: '12px 16px 10px', borderBottom: '1px solid var(--gk-border, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
          h('span', { style: { fontWeight: '600', fontSize: '13px', color: 'var(--gk-text, #1f2937)' } }, 'Available help'),
          h('span', { style: { fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)' } }, `${enabledCount} of ${items.length} enabled`),
        ]),
        // Items
        h('div', { style: { maxHeight: '320px', overflowY: 'auto' } }, rowNodes),
        // Footer
        h('div', { style: { padding: '8px 16px', borderTop: '1px solid var(--gk-border, #e5e7eb)' } }, [
          h('button', {
            type: 'button',
            onClick: resetAll,
            style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', padding: '0', textDecoration: 'underline', fontFamily: 'inherit' },
          }, 'Reset settings'),
        ]),
      ])

      return h(Teleport, { to: 'body' }, [triggerNode, panelNode])
    }
  },
})
