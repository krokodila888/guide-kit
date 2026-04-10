import React, { useState } from 'react'
import type { FormulaBlockProps } from './FormulaBlock.types'

export function FormulaBlock(props: FormulaBlockProps) {
  const [variablesOpen, setVariablesOpen] = useState(false)

  const containerStyle: React.CSSProperties = {
    fontFamily: 'var(--gk-font, inherit)',
    fontSize: '14px',
    color: 'var(--gk-text, #1f2937)',
  }

  const renderFormula = () => {
    if (props.mode === 'html') {
      return (
        <span
          style={{
            fontFamily: 'monospace',
            lineHeight: '1.8',
            display: 'inline-block',
          }}
          dangerouslySetInnerHTML={{ __html: props.html }}
        />
      )
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'monospace',
          }}
        >
          <span
            style={{
              borderBottom: '1.5px solid currentColor',
              paddingBottom: '2px',
              paddingLeft: '4px',
              paddingRight: '4px',
            }}
          >
            {props.numerator}
          </span>
          <span style={{ paddingTop: '2px', paddingLeft: '4px', paddingRight: '4px' }}>
            {props.denominator}
          </span>
        </span>
        {props.result && <span>= {props.result}</span>}
      </span>
    )
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          background: 'var(--gk-border, #e5e7eb)',
          borderRadius: 'var(--gk-radius, 8px)',
          padding: '12px 16px',
          marginBottom: props.variables || props.source ? '8px' : 0,
        }}
      >
        {renderFormula()}
      </div>

      {props.variables && props.variables.length > 0 && (
        <div style={{ marginBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setVariablesOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gk-primary, #2563eb)',
              fontSize: '13px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Variables {variablesOpen ? '▾' : '▸'}
          </button>
          {variablesOpen && (
            <ul style={{ margin: '6px 0 0 0', padding: '0 0 0 16px', fontSize: '13px' }}>
              {props.variables.map((v, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>
                  <strong>{v.symbol}</strong> — {v.description}
                  {v.unit && <span style={{ color: 'var(--gk-text-muted, #6b7280)' }}> [{v.unit}]</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {props.source && (
        <div style={{ fontSize: '12px', color: 'var(--gk-text-muted, #6b7280)' }}>
          Source: {props.source}
        </div>
      )}
    </div>
  )
}
