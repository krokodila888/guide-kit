import type { Placement } from '../../core/positioning'

export interface TourStep {
  target: string
  title?: string
  content: string | React.ReactNode
  placement?: Placement
  beforeShow?: () => void | Promise<void>
  afterShow?: () => void
}

export interface TourLocale {
  next: string
  back: string
  skip: string
  done: string
  of: string
}

export interface TourProps {
  steps: TourStep[]
  run: boolean
  onComplete?: () => void
  onSkip?: () => void
  onStepChange?: (index: number) => void
  spotlightPadding?: number
  overlayOpacity?: number
  locale?: Partial<TourLocale>
}

export interface TourHandle {
  start: () => void
  stop: () => void
  goTo: (index: number) => void
}
