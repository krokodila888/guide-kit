import type { Placement } from '../../core/positioning'

export interface FormulaConfig {
  mode: 'html' | 'fraction'
  html?: string
  numerator?: string
  denominator?: string
  result?: string
  variables?: Array<{ symbol: string; description: string; unit?: string }>
  source?: string
}

export interface HintContent {
  title?: string
  description: string
  range?: string
  unit?: string
  norm?: string
  formula?: FormulaConfig
}

export interface HintProps {
  content: HintContent | string
  trigger?: 'hover' | 'click'
  placement?: Placement
  children: React.ReactElement
}
