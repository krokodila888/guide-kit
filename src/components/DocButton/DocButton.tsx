import React, { useState, useRef, useEffect } from 'react'
import type { DocButtonProps, DocItem } from './DocButton.types'

function FileIcon({ type }: { type?: DocItem['fileType'] }) {
  const color =
    type === 'pdf' ? '#dc2626' :
    type === 'docx' ? '#2563eb' :
    type === 'xlsx' ? '#16a34a' :
    '#6b7280'

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="1" width="9" height="13" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M9 1v4h4" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M9 1l4 4" stroke={color} strokeWidth="1.5" />
      {type === 'pdf' && (
        <text x="3.5" y="11" fontSize="3.5" fontWeight="bold" fill={color} fontFamily="sans-serif">PDF</text>
      )}
      {type === 'docx' && (
        <text x="2.5" y="11" fontSize="3" fontWeight="bold" fill={color} fontFamily="sans-serif">DOCX</text>
      )}
      {type === 'xlsx' && (
        <text x="2.5" y="11" fontSize="3" fontWeight="bold" fill={color} fontFamily="sans-serif">XLSX</text>
      )}
    </svg>
  )
}

function downloadDoc(doc: DocItem) {
  const a = document.createElement('a')
  a.href = doc.url
  a.download = doc.filename ?? doc.label
  a.click()
}

export function DocButton({ docs, label = 'Documentation', variant = 'button' }: DocButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const docList = Array.isArray(docs) ? docs : [docs]
  const isSingle = docList.length === 1

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: 'var(--gk-radius, 8px)',
    border: '1px solid var(--gk-border, #e5e7eb)',
    background: 'var(--gk-bg, #ffffff)',
    color: 'var(--gk-text, #1f2937)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'var(--gk-font, inherit)',
  }

  if (variant === 'inline') {
    if (isSingle) {
      return (
        <a
          href={docList[0].url}
          download={docList[0].filename ?? docList[0].label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--gk-primary, #2563eb)',
            fontSize: '14px',
            textDecoration: 'none',
            fontFamily: 'var(--gk-font, inherit)',
          }}
        >
          <FileIcon type={docList[0].fileType} />
          {docList[0].label}
        </a>
      )
    }
  }

  if (isSingle) {
    return (
      <button type="button" style={buttonStyle} onClick={() => downloadDoc(docList[0])}>
        <FileIcon type={docList[0].fileType} />
        {label}
      </button>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setDropdownOpen(v => !v)}
        aria-expanded={dropdownOpen}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M9 1v4h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M9 1l4 4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {label} {dropdownOpen ? '▴' : '▾'}
      </button>
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: 'var(--gk-bg, #ffffff)',
            border: '1px solid var(--gk-border, #e5e7eb)',
            borderRadius: 'var(--gk-radius, 8px)',
            boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
            zIndex: 1000,
            minWidth: '220px',
            padding: '4px',
          }}
        >
          {docList.map((doc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { downloadDoc(doc); setDropdownOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--gk-text, #1f2937)',
                borderRadius: '6px',
                textAlign: 'left',
                fontFamily: 'var(--gk-font, inherit)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gk-border, #e5e7eb)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <FileIcon type={doc.fileType} />
              <span style={{ flex: 1 }}>{doc.label}</span>
              {doc.size && (
                <span style={{ color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' }}>{doc.size}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
