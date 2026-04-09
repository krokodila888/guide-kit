import type React from 'react'
import type { HelpItemRegistration } from '../../core/registry'

export type { HelpItemRegistration }

export type HelpPanelPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

export interface HelpPanelProps {
  items?: HelpItemRegistration[]
  position?: HelpPanelPosition
  label?: string
  storageKey?: string
  persistState?: boolean
  onOpen?: () => void
  onClose?: () => void
  onItemToggle?: (id: string, enabled: boolean) => void
  onItemActivate?: (id: string) => void
  className?: string
  style?: React.CSSProperties
}
