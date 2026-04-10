import { defineComponent, h } from 'vue'
import type { VideoSource } from './types'

const PlayIcon = () => h('svg', {
  width: '32', height: '32', viewBox: '0 0 24 24', fill: 'currentColor',
  style: { filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' },
}, [h('path', { d: 'M8 5v14l11-7z' })])

const ExternalIcon = () => h('svg', {
  width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', 'stroke-width': '2', style: { flexShrink: '0' },
}, [
  h('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
  h('polyline', { points: '15 3 21 3 21 9' }),
  h('line', { x1: '10', y1: '14', x2: '21', y2: '3' }),
])

export const GkVideoPanel = defineComponent({
  name: 'GkVideoPanel',
  props: {
    source:         { type: Object,  required: true },
    mode:           { type: String,  default: 'embed' },
    aspectRatio:    { type: String,  default: '16/9' },
    width:          { type: String,  default: '100%' },
    allowFullscreen: { type: Boolean, default: true },
    linkText:       { type: String,  default: 'Watch video' },
  },
  setup(props) {
    return () => {
      const src    = props.source as VideoSource
      const mode   = props.mode as string
      const ratio  = props.aspectRatio as string
      const width  = props.width as string

      const wrapperStyle = {
        fontFamily: 'var(--gk-font, inherit)',
        color:      'var(--gk-text, #1f2937)',
        width,
      }

      if (mode === 'embed') {
        const paddingBottom = ratio === '4/3' ? '75%' : '56.25%'
        const children = []

        if (src.title) {
          children.push(h('div', {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', fontSize: '14px' },
          }, [
            h('span', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
              PlayIcon(),
              h('span', { style: { fontWeight: '500' } }, src.title),
            ]),
            src.duration && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', fontSize: '13px' } }, src.duration),
          ]))
        }

        children.push(h('div', {
          style: { position: 'relative', paddingBottom, height: '0', overflow: 'hidden', borderRadius: 'var(--gk-radius, 8px)' },
        }, [
          h('iframe', {
            src: src.url,
            title: src.title ?? 'Video',
            allowfullscreen: props.allowFullscreen,
            style: { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: 'none' },
          }),
        ]))

        return h('div', { style: wrapperStyle }, children)
      }

      // Link mode — preview card
      const cardStyle = {
        border:       '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        overflow:     'hidden',
        display:      'flex',
        flexDirection: 'column' as const,
        cursor:       'pointer',
      }

      const thumbStyle = {
        position:       'relative' as const,
        paddingBottom:  ratio === '4/3' ? '75%' : '56.25%',
        background:     '#1e293b',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
      }

      const infoStyle = { padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }

      const thumbChildren: ReturnType<typeof h>[] = []
      if (src.thumbnail) {
        thumbChildren.push(h('img', {
          src: src.thumbnail,
          alt: src.title ?? '',
          style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover' },
        }))
      }
      thumbChildren.push(h('div', {
        style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
      }, [PlayIcon()]))

      return h('div', { style: wrapperStyle }, [
        h('a', { href: src.url, target: '_blank', rel: 'noopener', style: { textDecoration: 'none', color: 'inherit' } }, [
          h('div', { style: cardStyle }, [
            h('div', { style: thumbStyle }, thumbChildren),
            h('div', { style: infoStyle }, [
              h('div', {}, [
                src.title && h('div', { style: { fontWeight: '500', fontSize: '14px' } }, src.title),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--gk-primary, #2563eb)', fontSize: '13px' } }, [
                  ExternalIcon(),
                  h('span', {}, props.linkText as string),
                ]),
              ]),
              src.duration && h('span', { style: { color: 'var(--gk-text-muted, #6b7280)', fontSize: '13px', whiteSpace: 'nowrap' } }, src.duration),
            ]),
          ]),
        ]),
      ])
    }
  },
})
