import React from 'react'
import { SidebarSectionItem } from './SidebarSection'
import type { SidebarSection } from './types'

interface SidebarHeaderProps {
  title?: string
  onClose: () => void
}

export function SidebarHeader({ title, onClose }: SidebarHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--gk-border, #e5e7eb)',
        flexShrink: 0,
      }}
    >
      {title ? (
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--gk-text, #1f2937)' }}>{title}</span>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          lineHeight: 1,
          color: 'var(--gk-text-muted, #6b7280)',
          padding: '0',
        }}
      >
        ✕
      </button>
    </div>
  )
}

interface SidebarBodyProps {
  sections: SidebarSection[]
}

export function SidebarBody({ sections }: SidebarBodyProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {sections.map((section, i) => (
        <SidebarSectionItem key={section.id ?? i} section={section} />
      ))}
    </div>
  )
}
