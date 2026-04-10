import { defineComponent, h, ref, onMounted, onUnmounted, Teleport } from 'vue'
import type { DocItem } from './types'

function fileIconSvg(fileType?: DocItem['fileType']): string {
  const color =
    fileType === 'pdf'  ? '#dc2626' :
    fileType === 'docx' ? '#2563eb' :
    fileType === 'xlsx' ? '#16a34a' :
    '#6b7280'

  const label =
    fileType === 'pdf'  ? `<text x="3.5" y="11" font-size="3.5" font-weight="bold" fill="${color}" font-family="sans-serif">PDF</text>` :
    fileType === 'docx' ? `<text x="2.5" y="11" font-size="3" font-weight="bold" fill="${color}" font-family="sans-serif">DOCX</text>` :
    fileType === 'xlsx' ? `<text x="2.5" y="11" font-size="3" font-weight="bold" fill="${color}" font-family="sans-serif">XLSX</text>` :
    ''

  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;vertical-align:middle">
    <rect x="2" y="1" width="9" height="13" rx="1" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="M9 1v4h4" stroke="${color}" stroke-width="1.5" fill="none"/>
    <path d="M9 1l4 4" stroke="${color}" stroke-width="1.5"/>
    ${label}
  </svg>`
}

const DownloadIcon = () => h('svg', {
  width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', 'stroke-width': '2', style: { flexShrink: '0' },
}, [
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '7 10 12 15 17 10' }),
  h('line', { x1: '12', y1: '15', x2: '12', y2: '3' }),
])

const ChevronIcon = () => h('svg', {
  width: '12', height: '12', viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', 'stroke-width': '2', style: { flexShrink: '0' },
}, [h('polyline', { points: '6 9 12 15 18 9' })])

export const GkDocButton = defineComponent({
  name: 'GkDocButton',
  props: {
    docs:    { type: [Object, Array], required: true },
    label:   { type: String, default: 'Documentation' },
    variant: { type: String, default: 'button' },
  },
  setup(props) {
    const isOpen       = ref(false)
    const triggerRef   = ref<HTMLElement | null>(null)
    const dropdownRect = ref({ top: 0, left: 0, width: 0 })

    function openDropdown() {
      if (triggerRef.value) {
        const r = triggerRef.value.getBoundingClientRect()
        dropdownRect.value = { top: r.bottom + 4, left: r.left, width: r.width }
      }
      isOpen.value = true
    }

    function onClickOutside(e: MouseEvent) {
      if (triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
        isOpen.value = false
      }
    }

    onMounted(() => document.addEventListener('click', onClickOutside, true))
    onUnmounted(() => document.removeEventListener('click', onClickOutside, true))

    const btnStyle = {
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '6px',
      padding:      '8px 14px',
      background:   'var(--gk-bg, #ffffff)',
      color:        'var(--gk-text, #1f2937)',
      border:       '1px solid var(--gk-border, #e5e7eb)',
      borderRadius: 'var(--gk-radius, 8px)',
      cursor:       'pointer',
      fontSize:     '13px',
      fontWeight:   '500',
      fontFamily:   'inherit',
      textDecoration: 'none',
    }

    return () => {
      const docs   = props.docs as DocItem | DocItem[]
      const docList: DocItem[] = Array.isArray(docs) ? docs : [docs]
      const label  = props.label as string
      const variant = props.variant as string

      if (docList.length === 1) {
        const doc = docList[0]
        if (variant === 'inline') {
          return h('a', {
            href: doc.url,
            download: doc.filename ?? true,
            target: '_blank',
            rel: 'noopener',
            style: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gk-primary, #2563eb)', fontSize: '13px', textDecoration: 'underline' },
          }, [
            h('span', { innerHTML: fileIconSvg(doc.fileType) }),
            doc.label,
            doc.size && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' } }, `(${doc.size})`),
          ])
        }
        return h('a', {
          href: doc.url,
          download: doc.filename ?? true,
          target: '_blank',
          rel: 'noopener',
          style: { ...btnStyle },
        }, [
          h('span', { innerHTML: fileIconSvg(doc.fileType) }),
          doc.label,
          doc.size && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' } }, `(${doc.size})`),
          DownloadIcon(),
        ])
      }

      // Multiple docs — button + dropdown
      const dropStyle = {
        position:   'fixed' as const,
        top:        `${dropdownRect.value.top}px`,
        left:       `${dropdownRect.value.left}px`,
        minWidth:   `${Math.max(dropdownRect.value.width, 200)}px`,
        background: 'var(--gk-bg, #ffffff)',
        border:     '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        boxShadow:  'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
        zIndex:     '9999',
        overflow:   'hidden',
      }

      return h('div', { style: { display: 'inline-block' } }, [
        h('button', {
          ref: triggerRef,
          type: 'button',
          onClick: (e: Event) => { e.stopPropagation(); isOpen.value ? (isOpen.value = false) : openDropdown() },
          style: btnStyle,
        }, [
          DownloadIcon(),
          label,
          ChevronIcon(),
        ]),
        h(Teleport, { to: 'body' }, [
          isOpen.value && h('div', { style: dropStyle },
            docList.map((doc) =>
              h('a', {
                key: doc.url,
                href: doc.url,
                download: doc.filename ?? true,
                target: '_blank',
                rel: 'noopener',
                onClick: () => { isOpen.value = false },
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  color: 'var(--gk-text, #1f2937)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  borderBottom: '1px solid var(--gk-border, #e5e7eb)',
                  cursor: 'pointer',
                },
                onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = 'var(--gk-border, #f3f4f6)' },
                onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = '' },
              }, [
                h('span', { innerHTML: fileIconSvg(doc.fileType) }),
                h('span', { style: { flex: '1' } }, doc.label),
                doc.size && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px', whiteSpace: 'nowrap' } }, doc.size),
                DownloadIcon(),
              ]),
            ),
          ),
        ]),
      ])
    }
  },
})
