import { defineComponent, h, ref, watch, reactive, Teleport } from 'vue'
import { GkFormulaBlock } from './GkFormulaBlock'
import { GkDocButton }    from './GkDocButton'
import { GkVideoPanel }   from './GkVideoPanel'
import type { SidebarSection } from './types'

// ─── Section renderers ────────────────────────────────────────────────────────

function renderTextSection(section: SidebarSection) {
  return h('div', { style: { fontSize: '14px', lineHeight: '1.6', color: 'var(--gk-text, #1f2937)' } }, section.content ?? '')
}

function renderStepsSection(section: SidebarSection) {
  const steps = section.steps ?? []
  return h('ol', { style: { paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' } },
    steps.map((step, i) =>
      h('li', { key: i, style: { display: 'flex', gap: '10px', alignItems: 'flex-start' } }, [
        h('span', {
          style: {
            flexShrink: '0',
            width: '22px', height: '22px',
            borderRadius: '50%',
            background: step.done ? 'var(--gk-primary, #2563eb)' : 'var(--gk-border, #e5e7eb)',
            color:      step.done ? '#fff'                         : 'var(--gk-text-muted, #6b7280)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '600',
          },
        }, step.done ? '✓' : String(i + 1)),
        h('div', {}, [
          h('div', { style: { fontSize: '14px', fontWeight: '500', lineHeight: '1.4', color: 'var(--gk-text, #1f2937)' } }, step.label),
          step.description && h('div', { style: { fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', marginTop: '2px' } }, step.description),
        ]),
      ]),
    ),
  )
}

function renderChecklistSection(section: SidebarSection, checkedState: Record<string, boolean>) {
  const items = section.items ?? []
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    items.map((item) => {
      const checked = checkedState[item.id] ?? (item.checked ?? false)
      return h('label', {
        key: item.id,
        style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' },
      }, [
        h('input', {
          type: 'checkbox',
          checked,
          onChange: () => { checkedState[item.id] = !checked },
          style: { width: '16px', height: '16px', accentColor: 'var(--gk-primary, #2563eb)', flexShrink: '0' },
        }),
        h('span', {
          style: { color: checked ? 'var(--gk-text-muted, #6b7280)' : 'var(--gk-text, #1f2937)', textDecoration: checked ? 'line-through' : 'none' },
        }, item.label),
      ])
    }),
  )
}

function renderFormulaSection(section: SidebarSection) {
  const opts = section.formulaOptions
  if (!opts) return null
  return h(GkFormulaBlock, {
    mode:        opts.mode,
    html:        opts.html ?? '',
    numerator:   opts.numerator ?? '',
    denominator: opts.denominator ?? '',
    result:      opts.result ?? '',
    variables:   opts.variables ?? [],
    source:      opts.source ?? '',
  })
}

function renderDocSection(section: SidebarSection) {
  const opts = section.docOptions
  if (!opts) return null
  return h(GkDocButton, {
    docs:    opts.docs,
    label:   opts.label ?? 'Documentation',
    variant: opts.variant ?? 'button',
  })
}

function renderVideoSection(section: SidebarSection) {
  const opts = section.videoOptions
  if (!opts) return null
  return h(GkVideoPanel, {
    source:      opts.source,
    mode:        opts.mode ?? 'embed',
    aspectRatio: opts.aspectRatio ?? '16/9',
    linkText:    opts.linkText ?? 'Watch video',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

const CloseIcon = () => h('svg', {
  width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', 'stroke-width': '2',
}, [
  h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
  h('line', { x1: '6',  y1: '6', x2: '18', y2: '18' }),
])

export const GkSidebarOverlay = defineComponent({
  name: 'GkSidebarOverlay',
  props: {
    open:              { type: Boolean, required: true },
    title:             { type: String,  default: '' },
    side:              { type: String,  default: 'left' },
    width:             { type: Number,  default: 320 },
    showToggleButton:  { type: Boolean, default: true },
    toggleButtonLabel: { type: String,  default: 'Guide' },
    backdrop:          { type: Boolean, default: false },
    zIndex:            { type: Number,  default: 200 },
    sections:          { type: Array,   required: true },
  },
  emits: ['close', 'open'],
  setup(props, { emit }) {
    // Per-section collapsed state
    const collapsedState = reactive<Record<number, boolean>>({})
    // Per-item checked state for checklists
    const checkedState   = reactive<Record<string, boolean>>({})

    return () => {
      const side   = props.side as 'left' | 'right'
      const width  = props.width as number
      const zIndex = props.zIndex as number
      const open   = props.open

      // Panel transform
      const translate = open ? 'translateX(0)' : `translateX(${side === 'left' ? '-100%' : '100%'})`
      const panelStyle = {
        position:   'fixed' as const,
        top:        '0',
        [side]:     '0',
        width:      `${width}px`,
        height:     '100vh',
        background: 'var(--gk-bg, #ffffff)',
        borderRight:  side === 'left'  ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
        borderLeft:   side === 'right' ? '1px solid var(--gk-border, #e5e7eb)' : undefined,
        zIndex:     String(zIndex + 1),
        display:    'flex',
        flexDirection: 'column' as const,
        transform:  translate,
        transition: 'transform 0.25s ease',
        fontFamily: 'var(--gk-font, inherit)',
      }

      // Header
      const headerNode = h('div', {
        style: {
          padding: '14px 16px',
          borderBottom: '1px solid var(--gk-border, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: '0',
        },
      }, [
        h('span', { style: { fontWeight: '600', fontSize: '15px', color: 'var(--gk-text, #1f2937)' } }, props.title as string),
        h('button', {
          type: 'button',
          onClick: () => emit('close'),
          style: {
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--gk-text-muted, #6b7280)', display: 'flex', borderRadius: '4px',
          },
        }, [CloseIcon()]),
      ])

      // Body with sections
      const sections = props.sections as SidebarSection[]
      const sectionNodes = sections.map((section, i) => {
        const isCollapsible = section.collapsible ?? false
        const isCollapsed   = collapsedState[i] ?? false

        const headerEl = section.title ? h('div', {
          onClick: isCollapsible ? () => { collapsedState[i] = !isCollapsed } : undefined,
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: isCollapsed ? '0' : '10px',
            cursor: isCollapsible ? 'pointer' : 'default',
            userSelect: 'none' as const,
          },
        }, [
          h('span', { style: { fontWeight: '600', fontSize: '13px', color: 'var(--gk-text, #1f2937)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' } }, section.title),
          isCollapsible && h('svg', {
            width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
            stroke: 'currentColor', 'stroke-width': '2',
            style: { transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: '0' },
          }, [h('polyline', { points: '6 9 12 15 18 9' })]),
        ]) : null

        let bodyEl: ReturnType<typeof h> | null = null
        if (!isCollapsed) {
          switch (section.type) {
            case 'text':      bodyEl = renderTextSection(section);                   break
            case 'steps':     bodyEl = renderStepsSection(section);                  break
            case 'checklist': bodyEl = renderChecklistSection(section, checkedState); break
            case 'formula':   bodyEl = renderFormulaSection(section);                break
            case 'doc':       bodyEl = renderDocSection(section);                    break
            case 'video':     bodyEl = renderVideoSection(section);                  break
          }
        }

        return h('div', {
          key: i,
          style: { padding: '14px 16px', borderBottom: '1px solid var(--gk-border, #e5e7eb)' },
        }, [headerEl, bodyEl])
      })

      const bodyNode = h('div', { style: { flex: '1', overflowY: 'auto' as const } }, sectionNodes)

      // Backdrop
      const backdropNode = (props.backdrop && open)
        ? h('div', {
            onClick: () => emit('close'),
            style: { position: 'fixed', inset: '0', background: `rgba(0,0,0,0.4)`, zIndex: String(zIndex) },
          })
        : null

      // Toggle tab
      const tabStyle = {
        position:       'fixed' as const,
        top:            '50%',
        [side]:         '0',
        transform:      'translateY(-50%)',
        writingMode:    'vertical-rl' as const,
        textOrientation: 'mixed' as const,
        rotate:         side === 'left' ? '180deg' : '0deg',
        background:     'var(--gk-primary, #2563eb)',
        color:          '#fff',
        border:         'none',
        cursor:         'pointer',
        padding:        '12px 6px',
        fontSize:       '13px',
        fontWeight:     '500',
        borderRadius:   '6px 0 0 6px',
        fontFamily:     'inherit',
        whiteSpace:     'nowrap' as const,
        lineHeight:     '1',
        zIndex:         String(zIndex + 2),
        display:        (!open && props.showToggleButton) ? 'block' : 'none',
      }

      const tabNode = h('button', {
        type: 'button',
        onClick: () => emit('open'),
        style: tabStyle,
      }, props.toggleButtonLabel as string)

      return h(Teleport, { to: 'body' }, [
        backdropNode,
        h('div', { style: panelStyle }, [headerNode, bodyNode]),
        tabNode,
      ])
    }
  },
})
