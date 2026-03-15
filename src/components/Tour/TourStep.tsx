import React from 'react'
import type { TourStep as TourStepType, TourLocale } from './Tour.types'

interface TourStepProps {
  step: TourStepType
  stepIndex: number
  totalSteps: number
  locale: TourLocale
  position: { x: number; y: number }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
  popoverRef: React.RefObject<HTMLDivElement>
}

export function TourStepPopover({
  step,
  stepIndex,
  totalSteps,
  locale,
  position,
  onNext,
  onBack,
  onSkip,
  isFirst,
  isLast,
  popoverRef,
}: TourStepProps) {
  const styles = {
    popover: {
      position: 'fixed' as const,
      background: 'var(--gk-bg, #ffffff)',
      color: 'var(--gk-text, #1f2937)',
      border: '1px solid var(--gk-border, #e5e7eb)',
      borderRadius: 'var(--gk-radius, 8px)',
      boxShadow: 'var(--gk-shadow, 0 4px 24px rgba(0,0,0,0.12))',
      padding: '20px',
      maxWidth: '320px',
      minWidth: '260px',
      zIndex: 10000,
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: 'var(--gk-font, inherit)',
      left: position.x,
      top: position.y,
    } as React.CSSProperties,
  }

  return (
    <div ref={popoverRef} style={styles.popover} role="dialog" aria-modal="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        {step.title && <div style={{ fontWeight: 600, fontSize: '15px', flex: 1 }}>{step.title}</div>}
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gk-text-muted, #6b7280)',
            fontSize: '18px',
            padding: '0 0 0 8px',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label={locale.skip}
        >
          ×
        </button>
      </div>
      <div style={{ marginBottom: '16px' }}>{step.content}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--gk-text-muted, #6b7280)', fontSize: '12px' }}>
          {stepIndex + 1} {locale.of} {totalSteps}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isFirst && (
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--gk-border, #e5e7eb)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--gk-text, #1f2937)',
              }}
            >
              {locale.back}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--gk-primary, #2563eb)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {isLast ? locale.done : locale.next}
          </button>
        </div>
      </div>
    </div>
  )
}
