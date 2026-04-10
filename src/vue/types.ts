// ─── Hint ─────────────────────────────────────────────────────────────────────

export interface HintContent {
  title?: string
  description: string
  range?: string
  unit?: string
  norm?: string
}

// ─── Tour ─────────────────────────────────────────────────────────────────────

export interface TourStep {
  target: string
  title?: string
  content: string
  placement?: string
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

// ─── Formula ──────────────────────────────────────────────────────────────────

export interface Variable {
  symbol: string
  description: string
  unit?: string
}

// ─── DocButton ────────────────────────────────────────────────────────────────

export interface DocItem {
  label: string
  url: string
  filename?: string
  fileType?: 'pdf' | 'docx' | 'xlsx' | 'other'
  size?: string
}

// ─── VideoPanel ───────────────────────────────────────────────────────────────

export interface VideoSource {
  url: string
  title?: string
  duration?: string
  thumbnail?: string
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export type SidebarSectionType = 'text' | 'steps' | 'checklist' | 'formula' | 'doc' | 'video'

export interface SidebarSection {
  type: SidebarSectionType
  title?: string
  collapsible?: boolean
  /** type='text' */
  content?: string
  /** type='steps' */
  steps?: Array<{ label: string; description?: string; done?: boolean }>
  /** type='checklist' */
  items?: Array<{ id: string; label: string; checked?: boolean }>
  /** type='formula' */
  formulaOptions?: {
    mode: 'html' | 'fraction'
    html?: string
    numerator?: string
    denominator?: string
    result?: string
    variables?: Variable[]
    source?: string
  }
  /** type='doc' */
  docOptions?: {
    docs: DocItem | DocItem[]
    label?: string
    variant?: 'button' | 'inline'
  }
  /** type='video' */
  videoOptions?: {
    source: VideoSource
    mode?: 'embed' | 'link'
    aspectRatio?: '16/9' | '4/3'
    linkText?: string
  }
}

// ─── HelpPanel ────────────────────────────────────────────────────────────────

export type HelpItemType = 'tour' | 'hint' | 'sidebar' | 'doc' | 'video' | 'custom'

export interface HelpItem {
  id: string
  type: HelpItemType
  label: string
  description?: string
  action?: () => void
  defaultEnabled?: boolean
}
