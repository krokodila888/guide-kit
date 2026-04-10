// ─── Hint ─────────────────────────────────────────────────────────────────────

export interface VanillaHintContent {
  title?: string
  description: string
  range?: string
  unit?: string
  norm?: string
}

export interface VanillaHintOptions {
  content: string | VanillaHintContent
  placement?: string
  trigger?: 'hover' | 'click' | 'focus'
}

export interface HintInstance {
  show: () => void
  hide: () => void
  destroy: () => void
}

// ─── Tour ─────────────────────────────────────────────────────────────────────

export interface VanillaTourStep {
  target: string
  title?: string
  content: string
  placement?: string
  beforeShow?: () => void | Promise<void>
}

export interface VanillaTourOptions {
  steps: VanillaTourStep[]
  spotlightPadding?: number
  overlayOpacity?: number
  onComplete?: () => void
  onSkip?: () => void
  onStepChange?: (index: number) => void
  locale?: {
    next?: string
    back?: string
    skip?: string
    done?: string
    of?: string
  }
}

export interface TourInstance {
  start: () => void
  stop: () => void
  next: () => void
  back: () => void
  goTo: (index: number) => void
  destroy: () => void
}

// ─── FormulaBlock ─────────────────────────────────────────────────────────────

export interface VanillaFormulaVariable {
  symbol: string
  description: string
  unit?: string
}

export type VanillaFormulaOptions =
  | {
      mode: 'html'
      html: string
      variables?: VanillaFormulaVariable[]
      source?: string
    }
  | {
      mode: 'fraction'
      numerator: string
      denominator: string
      result?: string
      variables?: VanillaFormulaVariable[]
      source?: string
    }

export interface FormulaInstance {
  destroy: () => void
}

// ─── DocButton ────────────────────────────────────────────────────────────────

export interface VanillaDocItem {
  label: string
  url: string
  filename?: string
  fileType?: 'pdf' | 'docx' | 'xlsx' | 'other'
  size?: string
}

export interface VanillaDocButtonOptions {
  docs: VanillaDocItem | VanillaDocItem[]
  label?: string
  variant?: 'button' | 'inline'
}

export interface DocButtonInstance {
  destroy: () => void
}

// ─── VideoPanel ───────────────────────────────────────────────────────────────

export interface VanillaVideoSource {
  url: string
  title?: string
  duration?: string
  thumbnail?: string
}

export interface VanillaVideoPanelOptions {
  source: VanillaVideoSource
  mode?: 'embed' | 'link'
  aspectRatio?: '16/9' | '4/3'
  width?: string
  allowFullscreen?: boolean
  linkText?: string
}

export interface VideoPanelInstance {
  destroy: () => void
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export type VanillaSidebarSectionType = 'text' | 'steps' | 'checklist' | 'formula' | 'doc' | 'video'

export interface VanillaSidebarSection {
  type: VanillaSidebarSectionType
  title?: string
  collapsible?: boolean
  /** For type='text': HTML string or plain text */
  content?: string
  /** For type='steps' */
  steps?: Array<{ label: string; description?: string; done?: boolean }>
  /** For type='checklist' */
  items?: Array<{ id: string; label: string; checked?: boolean }>
  onItemChange?: (id: string, checked: boolean) => void
  /** For type='formula' */
  formulaOptions?: VanillaFormulaOptions
  /** For type='doc' */
  docOptions?: VanillaDocButtonOptions
  /** For type='video' */
  videoOptions?: VanillaVideoPanelOptions
}

export interface VanillaSidebarOptions {
  sections: VanillaSidebarSection[]
  title?: string
  side?: 'left' | 'right'
  width?: number
  showToggleButton?: boolean
  toggleButtonLabel?: string
  backdrop?: boolean
  zIndex?: number
  onOpen?: () => void
  onClose?: () => void
}

export interface SidebarInstance {
  open: () => void
  close: () => void
  toggle: () => void
  /** Show or hide the fixed toggle-tab button (язычок). */
  setTabVisible: (visible: boolean) => void
  destroy: () => void
}

// ─── HelpPanel ────────────────────────────────────────────────────────────────

export type VanillaHelpItemType = 'tour' | 'hint' | 'sidebar' | 'doc' | 'video' | 'custom'

export interface VanillaHelpItem {
  id: string
  type: VanillaHelpItemType
  label: string
  description?: string
  action: () => void
  defaultEnabled?: boolean
}

export interface VanillaHelpPanelOptions {
  items: VanillaHelpItem[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  label?: string
  storageKey?: string
  persistState?: boolean
  onItemActivate?: (id: string) => void
  onItemToggle?: (id: string, enabled: boolean) => void
}

export interface HelpPanelInstance {
  open: () => void
  close: () => void
  isEnabled: (id: string) => boolean
  setEnabled: (id: string, enabled: boolean) => void
  destroy: () => void
}
