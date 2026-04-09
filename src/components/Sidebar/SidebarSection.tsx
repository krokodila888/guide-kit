import React, { useState } from 'react'
import { DocButton } from '../DocButton/DocButton'
import { VideoPanel } from '../VideoPanel/VideoPanel'
import { FormulaBlock } from '../FormulaBlock/FormulaBlock'
import type {
  SidebarSection,
  TextSection,
  StepsSection,
  ChecklistSection,
  DocSection,
  VideoSection,
  FormulaSection,
} from './types'

function renderText(section: TextSection) {
  if (typeof section.content === 'string') {
    return (
      <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: 'var(--gk-text, #1f2937)' }}>
        {section.content}
      </p>
    )
  }
  return <>{section.content}</>
}

function renderSteps(section: StepsSection) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {section.steps.map((step, i) => (
        <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: step.done ? 0.6 : 1 }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              flexShrink: 0,
              background: step.done ? '#16a34a' : 'var(--gk-primary, #2563eb)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {step.done ? '✓' : i + 1}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gk-text, #1f2937)' }}>{step.label}</div>
            {step.description && (
              <div style={{ fontSize: '13px', color: 'var(--gk-text-muted, #6b7280)', marginTop: '2px' }}>
                {step.description}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function ChecklistSectionRenderer({ section }: { section: ChecklistSection }) {
  const [internalChecked, setInternalChecked] = useState<Record<string, boolean>>(() =>
    section.items.reduce<Record<string, boolean>>(
      (acc, item) => { acc[item.id] = item.checked ?? false; return acc },
      {}
    )
  )

  const handleChange = (id: string, checked: boolean) => {
    if (section.onItemChange) {
      section.onItemChange(id, checked)
    } else {
      setInternalChecked(prev => ({ ...prev, [id]: checked }))
    }
  }

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {section.items.map(item => {
        const isChecked = section.onItemChange
          ? (item.checked ?? false)
          : (internalChecked[item.id] ?? false)
        return (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={`gk-chk-${item.id}`}
              checked={isChecked}
              onChange={e => handleChange(item.id, e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
            />
            <label
              htmlFor={`gk-chk-${item.id}`}
              style={{
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--gk-text, #1f2937)',
                textDecoration: isChecked ? 'line-through' : 'none',
              }}
            >
              {item.label}
            </label>
          </li>
        )
      })}
    </ul>
  )
}

function renderDoc(section: DocSection) {
  return <DocButton docs={section.docs} />
}

function renderVideo(section: VideoSection) {
  return <VideoPanel source={section.source} mode={section.mode} />
}

function renderFormula(section: FormulaSection) {
  return <FormulaBlock {...section.formula} />
}

function renderSectionContent(section: SidebarSection) {
  switch (section.type) {
    case 'text': return renderText(section)
    case 'steps': return renderSteps(section)
    case 'checklist': return <ChecklistSectionRenderer section={section} />
    case 'doc': return renderDoc(section)
    case 'video': return renderVideo(section)
    case 'formula': return renderFormula(section)
  }
}

interface SidebarSectionProps {
  section: SidebarSection
}

export function SidebarSectionItem({ section }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen !== false)

  const content = renderSectionContent(section)

  if (section.collapsible) {
    return (
      <div style={{ borderBottom: '1px solid var(--gk-border, #e5e7eb)', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--gk-text, #1f2937)',
            fontFamily: 'var(--gk-font, inherit)',
            textAlign: 'left',
          }}
        >
          {section.title ?? ''}
          <span style={{ fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)' }}>
            {isOpen ? '▾' : '▸'}
          </span>
        </button>
        {isOpen && content}
      </div>
    )
  }

  return (
    <div style={{ borderBottom: '1px solid var(--gk-border, #e5e7eb)', paddingBottom: '12px' }}>
      {section.title && (
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--gk-text, #1f2937)' }}>
          {section.title}
        </div>
      )}
      {content}
    </div>
  )
}
