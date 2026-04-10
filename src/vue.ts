// ─── Components ───────────────────────────────────────────────────────────────
export { GkHint }           from './vue/GkHint'
export { GkTour }           from './vue/GkTour'
export { GkFormulaBlock }   from './vue/GkFormulaBlock'
export { GkDocButton }      from './vue/GkDocButton'
export { GkVideoPanel }     from './vue/GkVideoPanel'
export { GkSidebarOverlay } from './vue/GkSidebarOverlay'
export { GkHelpPanel }      from './vue/GkHelpPanel'

// ─── Composables ──────────────────────────────────────────────────────────────
export { useHelpRegistry }  from './vue/useHelpRegistry'
export { useFloating, usePopoverState, useTrigger } from './vue/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  HintContent,
  TourStep,
  TourLocale,
  Variable,
  DocItem,
  VideoSource,
  SidebarSection,
  SidebarSectionType,
  HelpItem,
  HelpItemType,
} from './vue/types'
