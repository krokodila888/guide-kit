import type { SidebarSection } from '../Sidebar/types'

export type { SidebarSection }

export interface SidebarOverlayProps {
  sections: SidebarSection[]
  open: boolean
  onClose: () => void
  onOpen?: () => void
  title?: string
  side?: 'left' | 'right'
  width?: number | string
  showToggleButton?: boolean
  toggleButtonLabel?: string
  backdrop?: boolean
  zIndex?: number
  className?: string
  style?: React.CSSProperties
}
