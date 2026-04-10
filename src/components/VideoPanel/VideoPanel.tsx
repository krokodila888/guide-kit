import React from 'react'
import type { VideoPanelProps } from './VideoPanel.types'

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const ExternalIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export function VideoPanel({
  source,
  mode = 'embed',
  aspectRatio = '16/9',
  width = '100%',
  allowFullscreen = true,
  linkText = 'Watch video',
  className,
  style,
}: VideoPanelProps) {
  const paddingBottom = aspectRatio === '4/3' ? '75%' : '56.25%'

  if (mode === 'embed') {
    return (
      <div
        className={className}
        style={{
          width,
          fontFamily: 'var(--gk-font, inherit)',
          ...style,
        }}
      >
        {source.title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px',
              color: 'var(--gk-text, #1f2937)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlayIcon />
              <span style={{ fontWeight: 500 }}>{source.title}</span>
            </span>
            {source.duration && (
              <span style={{ color: 'var(--gk-text-muted, #6b7280)', fontSize: '13px' }}>
                {source.duration}
              </span>
            )}
          </div>
        )}
        <div style={{ position: 'relative', paddingBottom, height: 0, overflow: 'hidden', borderRadius: 'var(--gk-radius, 8px)' }}>
          <iframe
            src={source.url}
            title={source.title ?? 'Video'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              border: 'none',
              width: '100%',
              height: '100%',
            }}
            allowFullScreen={allowFullscreen}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    )
  }

  // mode === 'link'
  return (
    <div
      className={className}
      style={{
        width,
        background: 'var(--gk-bg, #ffffff)',
        border: '1px solid var(--gk-border, #e5e7eb)',
        borderRadius: 'var(--gk-radius, 8px)',
        boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
        overflow: 'hidden',
        fontFamily: 'var(--gk-font, inherit)',
        ...style,
      }}
    >
      {/* Preview area */}
      <div style={{ position: 'relative', paddingBottom, height: 0, overflow: 'hidden', background: '#f3f4f6' }}>
        {source.thumbnail ? (
          <img
            src={source.thumbnail}
            alt={source.title ?? 'Video'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gk-text-muted, #6b7280)',
            }}
          >
            <PlayIcon />
          </div>
        )}
        {source.duration && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {source.duration}
          </span>
        )}
      </div>

      {/* Card bottom */}
      <div style={{ padding: '12px 16px' }}>
        {source.title && (
          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '8px', color: 'var(--gk-text, #1f2937)' }}>
            {source.title}
          </div>
        )}
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--gk-primary, #2563eb)',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          <ExternalIcon />
          {linkText}
        </a>
      </div>
    </div>
  )
}
