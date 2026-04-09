import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { OverlayManager } from '../../core/overlay'
import { computePosition } from '../../core/positioning'
import { TourStepPopover } from './TourStep'
import type { TourProps, TourHandle, TourLocale } from './Tour.types'
import type { Placement } from '../../core/positioning'

const defaultLocale: TourLocale = {
  next: 'Далее',
  back: 'Назад',
  skip: 'Пропустить',
  done: 'Готово',
  of: 'из',
}

export const Tour = forwardRef<TourHandle, TourProps>(function Tour(
  {
    steps,
    run,
    onComplete,
    onSkip,
    onStepChange,
    spotlightPadding = 8,
    overlayOpacity = 0.65,
    locale: localeProp,
  },
  ref
) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)
  const locale = { ...defaultLocale, ...localeProp }

  const showStep = useCallback(async (index: number) => {
    if (index < 0 || index >= steps.length) return
    const step = steps[index]
    const targetEl = document.querySelector(step.target)
    if (!targetEl) return

    if (step.beforeShow) await step.beforeShow()

    // Scroll element into view if it is outside the visible viewport
    const rect = targetEl.getBoundingClientRect()
    const inViewport =
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth
    if (!inViewport) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      await new Promise<void>(resolve => setTimeout(resolve, 400))
    }

    OverlayManager.show(targetEl, spotlightPadding, overlayOpacity)

    if (popoverRef.current) {
      const result = await computePosition(
        targetEl,
        popoverRef.current,
        (step.placement ?? 'bottom') as Placement
      )
      setPosition({ x: result.x, y: result.y })
    }

    step.afterShow?.()
    onStepChange?.(index)
  }, [steps, spotlightPadding, overlayOpacity, onStepChange])

  useEffect(() => {
    if (run && !isActive) {
      setIsActive(true)
      setCurrentStep(0)
    } else if (!run && isActive) {
      setIsActive(false)
      OverlayManager.hide()
    }
  }, [run])

  useEffect(() => {
    if (isActive) {
      showStep(currentStep)
    }
  }, [isActive, currentStep, showStep])

  useEffect(() => {
    if (!isActive) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      else if (e.key === 'ArrowLeft') handleBack()
      else if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isActive, currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      OverlayManager.hide()
      setIsActive(false)
      onComplete?.()
    }
  }, [currentStep, steps.length, onComplete])

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
  }, [currentStep])

  const handleSkip = useCallback(() => {
    OverlayManager.hide()
    setIsActive(false)
    onSkip?.()
  }, [onSkip])

  useImperativeHandle(ref, () => ({
    start: () => {
      setCurrentStep(0)
      setIsActive(true)
    },
    stop: () => {
      OverlayManager.hide()
      setIsActive(false)
    },
    goTo: (index: number) => {
      setCurrentStep(index)
    },
  }))

  if (!isActive || steps.length === 0) return null

  return createPortal(
    <TourStepPopover
      step={steps[currentStep]}
      stepIndex={currentStep}
      totalSteps={steps.length}
      locale={locale}
      position={position}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      isFirst={currentStep === 0}
      isLast={currentStep === steps.length - 1}
      popoverRef={popoverRef as React.RefObject<HTMLDivElement>}
    />,
    document.body
  )
})

export function useTour(tourRef: React.RefObject<TourHandle>) {
  const start = useCallback(() => tourRef.current?.start(), [tourRef])
  const stop = useCallback(() => tourRef.current?.stop(), [tourRef])
  const goTo = useCallback((index: number) => tourRef.current?.goTo(index), [tourRef])
  return { start, stop, goTo }
}
