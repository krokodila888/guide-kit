import type { SidebarSection } from '../Sidebar/types'

export type { SidebarSection }

export interface SidebarPushProps {
  sections: SidebarSection[]
  open: boolean
  onClose: () => void
  onOpen?: () => void
  title?: string
  side?: 'left' | 'right'
  width?: number | string
  showToggleButton?: boolean
  toggleButtonLabel?: string
  animated?: boolean
  containerSelector?: string
  className?: string
  style?: React.CSSProperties
}
