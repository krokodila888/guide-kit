import type { DocItem } from '../DocButton/DocButton.types'
import type { VideoSource } from '../VideoPanel/VideoPanel.types'
import type { FormulaHTMLProps, FormulaObjectProps } from '../FormulaBlock/FormulaBlock.types'

export type { DocItem, VideoSource, FormulaHTMLProps, FormulaObjectProps }

interface SidebarSectionBase {
  id?: string
  title?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface TextSection extends SidebarSectionBase {
  type: 'text'
  content: string | React.ReactNode
}

export interface StepsSection extends SidebarSectionBase {
  type: 'steps'
  steps: Array<{
    label: string
    description?: string
    done?: boolean
  }>
}

export interface ChecklistSection extends SidebarSectionBase {
  type: 'checklist'
  items: Array<{ id: string; label: string; checked?: boolean }>
  onItemChange?: (id: string, checked: boolean) => void
}

export interface DocSection extends SidebarSectionBase {
  type: 'doc'
  docs: DocItem | DocItem[]
}

export interface VideoSection extends SidebarSectionBase {
  type: 'video'
  source: VideoSource
  mode?: 'embed' | 'link'
}

export interface FormulaSection extends SidebarSectionBase {
  type: 'formula'
  formula: FormulaHTMLProps | FormulaObjectProps
}

export type SidebarSection =
  | TextSection
  | StepsSection
  | ChecklistSection
  | DocSection
  | VideoSection
  | FormulaSection
