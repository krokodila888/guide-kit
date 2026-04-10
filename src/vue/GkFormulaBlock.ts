import { defineComponent, h, ref, type Ref } from 'vue'
import type { Variable } from './types'

const ChevronIcon = (open: boolean) =>
  h('svg', {
    width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': '2',
    style: { transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: '0' },
  }, [
    h('polyline', { points: '6 9 12 15 18 9' }),
  ])

function renderVariables(variables: Variable[], isOpen: Ref<boolean>) {
  return h('div', { style: { marginTop: '12px' } }, [
    h('button', {
      type: 'button',
      onClick: () => { isOpen.value = !isOpen.value },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        fontSize: '13px',
        color: 'var(--gk-text-muted, #6b7280)',
        fontFamily: 'inherit',
      },
    }, [ChevronIcon(isOpen.value), 'Variables']),
    isOpen.value && h('div', { style: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' } },
      variables.map((v) =>
        h('div', {
          key: v.symbol,
          style: { display: 'flex', gap: '8px', fontSize: '13px', alignItems: 'baseline' },
        }, [
          h('span', { style: { fontWeight: '600', minWidth: '32px', color: 'var(--gk-primary, #2563eb)', fontFamily: 'monospace' } }, v.symbol),
          h('span', { style: { color: 'var(--gk-text, #1f2937)' } }, v.description),
          v.unit && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', marginLeft: 'auto', whiteSpace: 'nowrap' } }, v.unit),
        ]),
      ),
    ),
  ])
}

export const GkFormulaBlock = defineComponent({
  name: 'GkFormulaBlock',
  props: {
    mode:        { type: String,  required: true },
    html:        { type: String,  default: '' },
    numerator:   { type: String,  default: '' },
    denominator: { type: String,  default: '' },
    result:      { type: String,  default: '' },
    variables:   { type: Array,   default: () => [] },
    source:      { type: String,  default: '' },
  },
  setup(props) {
    const varsOpen = ref(false)

    return () => {
      const variables = props.variables as Variable[]
      const wrapperStyle = {
        fontFamily: 'var(--gk-font, inherit)',
        color:      'var(--gk-text, #1f2937)',
        fontSize:   '14px',
      }

      const formulaBoxStyle = {
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '8px',
        background:   'var(--gk-border, #f3f4f6)',
        borderRadius: 'var(--gk-radius, 8px)',
        padding:      '10px 16px',
        marginBottom: '8px',
        flexWrap:     'wrap' as const,
      }

      let formulaNode
      if (props.mode === 'html') {
        // innerHTML — trusts the caller to provide safe markup
        formulaNode = h('div', { style: formulaBoxStyle }, [
          h('span', { innerHTML: props.html }),
        ])
      } else {
        // Fraction mode
        const fractionNode = h('span', {
          style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
        }, [
          h('span', { style: { borderBottom: '1px solid currentColor', paddingBottom: '2px' } }, props.numerator),
          h('span', { style: { paddingTop: '2px' } }, props.denominator),
        ])
        const nodes: ReturnType<typeof h>[] = [fractionNode]
        if (props.result) {
          nodes.unshift(h('span', {}, `${props.result} = `))
        }
        formulaNode = h('div', { style: formulaBoxStyle }, nodes)
      }

      const children: ReturnType<typeof h>[] = [formulaNode]

      if (props.source) {
        children.push(h('div', {
          style: { fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)', marginBottom: '4px', fontStyle: 'italic' },
        }, props.source))
      }

      if (variables.length > 0) {
        children.push(renderVariables(variables, varsOpen))
      }

      return h('div', { style: wrapperStyle }, children)
    }
  },
})
